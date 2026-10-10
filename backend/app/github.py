"""Lectura de PRs abiertas desde la API REST de GitHub con httpx (asíncrono)."""

import asyncio
from datetime import datetime, timezone

import httpx

from .schemas import PRInfo

_FAIL_CONCLUSIONS = {"failure", "timed_out", "cancelled", "action_required", "startup_failure"}


class GitHubError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


def _days_since(iso: str, now: datetime) -> int:
    dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    return max(0, (now - dt).days)


def _review_state(reviews: list[dict]) -> str:
    """Estado agregado: vale la última review 'decisiva' de cada revisor."""
    latest: dict[str, str] = {}
    commented = False
    for r in reviews:  # GitHub las devuelve en orden cronológico
        user = (r.get("user") or {}).get("login", "?")
        state = r.get("state")
        if state in ("APPROVED", "CHANGES_REQUESTED", "DISMISSED"):
            latest[user] = state
        elif state == "COMMENTED":
            commented = True
    states = set(latest.values())
    if "CHANGES_REQUESTED" in states:
        return "changes_requested"
    if "APPROVED" in states:
        return "approved"
    return "commented" if commented else "none"


def _ci_state(combined: dict | None, check_runs: dict | None) -> str:
    states: list[str] = []
    if combined and combined.get("total_count", 0) > 0:
        s = combined.get("state")
        states.append({"error": "failure"}.get(s, s))
    for run in (check_runs or {}).get("check_runs", []):
        if run.get("status") != "completed":
            states.append("pending")
        elif run.get("conclusion") in _FAIL_CONCLUSIONS:
            states.append("failure")
        else:
            states.append("success")
    if not states:
        return "none"
    if "failure" in states:
        return "failure"
    if "pending" in states:
        return "pending"
    return "success"


class GitHubClient:
    def __init__(self, client: httpx.AsyncClient, concurrency: int = 8):
        self._client = client
        self._sem = asyncio.Semaphore(concurrency)

    @classmethod
    def build_http_client(cls, base_url: str, token: str | None, **kwargs) -> httpx.AsyncClient:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "standup-pr-bot",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"
        return httpx.AsyncClient(base_url=base_url, headers=headers, timeout=20.0, **kwargs)

    async def _get(self, path: str, params: dict | None = None, optional: bool = False):
        async with self._sem:
            resp = await self._client.get(path, params=params)
        if resp.status_code == 200:
            return resp.json()
        if optional:
            return None  # p. ej. checks sin permisos: seguimos sin ese dato
        if resp.status_code == 404:
            raise GitHubError(404, "Repositorio no encontrado (o privado sin GITHUB_TOKEN con acceso)")
        if resp.status_code in (403, 429) and resp.headers.get("x-ratelimit-remaining") == "0":
            raise GitHubError(429, "Límite de peticiones de GitHub agotado; configura GITHUB_TOKEN")
        if resp.status_code == 401:
            raise GitHubError(401, "GITHUB_TOKEN no válido")
        raise GitHubError(502, f"GitHub respondió {resp.status_code} en {path}")

    async def open_pull_requests(self, repo: str, max_prs: int) -> list[PRInfo]:
        pulls = await self._get(
            f"/repos/{repo}/pulls",
            params={"state": "open", "per_page": max_prs, "sort": "updated", "direction": "desc"},
        )
        now = datetime.now(timezone.utc)
        return list(await asyncio.gather(*(self._enrich(repo, p, now) for p in pulls[:max_prs])))

    async def _enrich(self, repo: str, pr: dict, now: datetime) -> PRInfo:
        number = pr["number"]
        sha = pr["head"]["sha"]
        detail, reviews, combined, checks = await asyncio.gather(
            self._get(f"/repos/{repo}/pulls/{number}", optional=True),
            self._get(f"/repos/{repo}/pulls/{number}/reviews", params={"per_page": 100}, optional=True),
            self._get(f"/repos/{repo}/commits/{sha}/status", optional=True),
            self._get(f"/repos/{repo}/commits/{sha}/check-runs", params={"per_page": 100}, optional=True),
        )
        detail = detail or {}
        return PRInfo(
            number=number,
            title=pr["title"],
            url=pr["html_url"],
            author=(pr.get("user") or {}).get("login", "?"),
            draft=bool(pr.get("draft")),
            labels=[lbl["name"] for lbl in pr.get("labels", [])],
            created_at=pr["created_at"],
            updated_at=pr["updated_at"],
            age_days=_days_since(pr["created_at"], now),
            idle_days=_days_since(pr["updated_at"], now),
            additions=detail.get("additions"),
            deletions=detail.get("deletions"),
            changed_files=detail.get("changed_files"),
            review_state=_review_state(reviews or []),
            ci_state=_ci_state(combined, checks),
            mergeable_state=detail.get("mergeable_state"),
            requested_reviewers=[u["login"] for u in pr.get("requested_reviewers", [])],
        )
