"""API del stand-up de PRs: lee, prioriza, resume y lo cuenta en voz alta."""

import asyncio
import base64
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, get_settings
from .github import GitHubClient, GitHubError
from .narration import build_summary
from .priority import counts, prioritize
from .schemas import StandupRequest, StandupResponse
from .voice import VoiceError, mime_for, synthesize


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    if not hasattr(app.state, "http"):  # los tests pueden inyectar su propio cliente
        app.state.http = GitHubClient.build_http_client(settings.github_api_url, settings.github_token)
    yield
    await app.state.http.aclose()


settings_at_import = get_settings()
app = FastAPI(title="PR Stand-up", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings_at_import.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_github(request: Request) -> GitHubClient:
    return GitHubClient(request.app.state.http)


@app.get("/health")
async def health(settings: Settings = Depends(get_settings)) -> dict:
    return {
        "ok": True,
        "github_token": bool(settings.github_token),
        "elevenlabs": bool(settings.elevenlabs_api_key),
    }


@app.post("/standup", response_model=StandupResponse)
async def standup(
    body: StandupRequest,
    gh: GitHubClient = Depends(get_github),
    settings: Settings = Depends(get_settings),
) -> StandupResponse:
    try:
        prs, total_open = await asyncio.gather(
            gh.open_pull_requests(body.repo, body.max_prs, body.order),
            gh.count_open_pull_requests(body.repo),
        )
    except GitHubError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    ranked = prioritize(prs, body.lang)
    # Si la búsqueda de GitHub falla, al menos sabemos que hay tantas como las analizadas
    total_open = max(total_open or 0, len(ranked))
    summary = build_summary(
        body.repo, ranked, body.lang, body.spoken_top, total_open, body.order, body.style
    )

    response = StandupResponse(
        repo=body.repo,
        generated_at=datetime.now(timezone.utc).isoformat(),
        total_open=total_open,
        analyzed=len(ranked),
        order=body.order,
        style=body.style,
        counts=counts(ranked),
        summary=summary,
        prs=ranked,
    )

    if body.include_audio:
        # Si falla la voz devolvemos igualmente el análisis: el front puede mostrar el texto.
        try:
            audio = await synthesize(summary, settings, body.lang, body.style)
            response.audio_base64 = base64.b64encode(audio).decode("ascii")
            response.audio_mime = mime_for(settings.elevenlabs_output_format)
        except VoiceError as exc:
            response.audio_error = str(exc)

    return response
