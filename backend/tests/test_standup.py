"""Tests sin red: GitHub se simula con httpx.MockTransport y ElevenLabs con monkeypatch."""

from datetime import datetime, timedelta, timezone

import httpx
import pytest
from fastapi.testclient import TestClient

import app.main as main
from app.github import GitHubClient
from app.voice import VoiceError

REPO = "acme/demo"


def iso(days_ago: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat().replace("+00:00", "Z")


PULLS = [
    {"number": 1, "title": "Fix login crash", "html_url": "https://github.com/acme/demo/pull/1",
     "user": {"login": "ana"}, "draft": False, "labels": [{"name": "bug"}],
     "created_at": iso(9), "updated_at": iso(8), "head": {"sha": "s1"}, "requested_reviewers": [{"login": "bob"}]},
    {"number": 2, "title": "Add dark mode", "html_url": "https://github.com/acme/demo/pull/2",
     "user": {"login": "bob"}, "draft": False, "labels": [],
     "created_at": iso(2), "updated_at": iso(0), "head": {"sha": "s2"}, "requested_reviewers": []},
    {"number": 3, "title": "WIP refactor", "html_url": "https://github.com/acme/demo/pull/3",
     "user": {"login": "eva"}, "draft": True, "labels": [],
     "created_at": iso(1), "updated_at": iso(1), "head": {"sha": "s3"}, "requested_reviewers": []},
]
DETAILS = {
    1: {"additions": 20, "deletions": 5, "changed_files": 2, "mergeable_state": "unstable"},
    2: {"additions": 300, "deletions": 40, "changed_files": 9, "mergeable_state": "clean"},
    3: {"additions": 2000, "deletions": 900, "changed_files": 40, "mergeable_state": "clean"},
}
REVIEWS = {1: [], 2: [{"user": {"login": "ana"}, "state": "APPROVED"}], 3: []}
CHECKS = {
    "s1": [{"status": "completed", "conclusion": "failure"}],
    "s2": [{"status": "completed", "conclusion": "success"}],
    "s3": [],
}


def handler(request: httpx.Request) -> httpx.Response:
    p = request.url.path
    if p == f"/repos/{REPO}/pulls":
        return httpx.Response(200, json=PULLS)
    if p.startswith(f"/repos/{REPO}/pulls/") and p.endswith("/reviews"):
        return httpx.Response(200, json=REVIEWS[int(p.split("/")[-2])])
    if p.startswith(f"/repos/{REPO}/pulls/"):
        return httpx.Response(200, json=DETAILS[int(p.split("/")[-1])])
    if p.endswith("/status"):
        return httpx.Response(200, json={"state": "pending", "total_count": 0})
    if p.endswith("/check-runs"):
        return httpx.Response(200, json={"check_runs": CHECKS[p.split("/")[-2]]})
    return httpx.Response(404, json={"message": "Not Found"})


@pytest.fixture
def client(monkeypatch):
    async def fake_tts(text, settings, lang="es"):
        return b"ID3fake-mp3"

    monkeypatch.setattr(main, "synthesize", fake_tts)
    main.app.state.http = GitHubClient.build_http_client(
        "https://api.github.com", None, transport=httpx.MockTransport(handler)
    )
    with TestClient(main.app) as c:
        yield c
    del main.app.state.http


def test_standup_prioritizes_and_speaks(client):
    r = client.post("/standup", json={"repo": f"https://github.com/{REPO}"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["repo"] == REPO
    assert data["total_open"] == 3
    order = [p["pr"]["number"] for p in data["prs"]]
    assert order[-1] == 3  # el borrador va al final
    by_num = {p["pr"]["number"]: p for p in data["prs"]}
    assert by_num[1]["status"] == "ci_fallando"
    assert by_num[2]["status"] == "listo_para_merge"
    assert by_num[3]["status"] == "borrador"
    assert by_num[1]["level"] == "alta"
    assert all(p["reasons"] for p in data["prs"])
    assert "Número 1" in data["summary"] and "WIP refactor" not in data["summary"]
    assert data["audio_mime"] == "audio/mpeg" and data["audio_base64"]


def test_audio_failure_still_returns_analysis(client, monkeypatch):
    async def broken(text, settings, lang="es"):
        raise VoiceError("Falta ELEVENLABS_API_KEY")

    monkeypatch.setattr(main, "synthesize", broken)
    data = client.post("/standup", json={"repo": REPO, "lang": "en"}).json()
    assert data["audio_base64"] is None
    assert data["audio_error"] == "Falta ELEVENLABS_API_KEY"
    assert data["summary"].startswith("Hi.")


def test_unknown_repo_is_404(client):
    r = client.post("/standup", json={"repo": "nobody/nothing"})
    assert r.status_code == 404


def test_bad_repo_format_is_422(client):
    assert client.post("/standup", json={"repo": "not a repo"}).status_code == 422
