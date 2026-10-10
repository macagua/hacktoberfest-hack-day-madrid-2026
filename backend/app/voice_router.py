"""Router /api/v1/voice — pipeline completo: STT → Gemma 4 → TTS streaming."""

import urllib.parse
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse

from .config import Settings, get_settings
from .gemma import GemmaError, synthesize_speech_script
from .github import GitHubClient, GitHubError
from .voice import VoiceError, mime_for, synthesize_stream, transcribe

router = APIRouter(prefix="/api/v1/voice", tags=["Voice Pipeline"])


def _get_github(request: Request) -> GitHubClient:
    return GitHubClient(request.app.state.http)


@router.post("/chat")
async def voice_chat(
    audio: UploadFile = File(..., description="Audio del micrófono (webm/mp3/wav)"),
    repo: str | None = Form(None, description="Repositorio activo (owner/name)"),
    voice_id: str | None = Form(None, description="Sobrescritura opcional de voz ElevenLabs"),
    gh: GitHubClient = Depends(_get_github),
    settings: Settings = Depends(get_settings),
) -> StreamingResponse:
    # 1. Transcripción con ElevenLabs Scribe
    audio_bytes = await audio.read()
    try:
        transcription = await transcribe(
            audio_bytes,
            audio.filename or "voice.webm",
            audio.content_type or "audio/webm",
            settings,
        )
    except VoiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    if not transcription.strip():
        raise HTTPException(status_code=422, detail="No se detectó audio comprensible.")

    # 2. Obtener PRs del repo (usa REST existente)
    target_repo = repo or ""
    if not target_repo:
        raise HTTPException(status_code=422, detail="Parámetro 'repo' requerido (owner/name).")
    try:
        prs = await gh.open_pull_requests(target_repo, max_prs=30)
    except GitHubError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)

    github_data = {
        "repo": target_repo,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "open_prs": [pr.model_dump() for pr in prs],
    }

    # 3. Sintetizar guion narrativo con Gemma 4
    try:
        speech_script = await synthesize_speech_script(transcription, github_data, settings)
    except GemmaError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    # 4. Streaming TTS con ElevenLabs Turbo v2.5
    try:
        audio_stream = synthesize_stream(speech_script, settings, voice_id_override=voice_id)
    except VoiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    headers = {
        "X-User-Transcript": urllib.parse.quote(transcription, safe=""),
        "X-Speech-Script": urllib.parse.quote(speech_script, safe=""),
        "Access-Control-Expose-Headers": "X-User-Transcript, X-Speech-Script",
    }

    return StreamingResponse(
        content=audio_stream,
        media_type=mime_for(settings.elevenlabs_output_format),
        headers=headers,
    )
