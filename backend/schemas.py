"""Modelos de entrada y salida de la API."""

import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator

_REPO_RE = re.compile(r"^(?:https?://github\.com/)?([\w.-]+)/([\w.-]+?)(?:\.git)?/?$")


Style = Literal["radio", "futbol", "documental", "neutro"]


class StandupRequest(BaseModel):
    repo: str = Field(
        ...,
        description="Repositorio como 'owner/name' o URL de GitHub",
        examples=["macagua/hacktoberfest-hack-day-madrid-2026"],
    )
    lang: Literal["es", "en"] = "es"
    style: Style = Field(
        "radio",
        description="Formato del locutor: 'radio' (programa matinal), 'futbol' (narrador deportivo), "
        "'documental' (narrador de naturaleza) o 'neutro' (resumen sobrio)",
    )
    max_prs: int = Field(30, ge=1, le=100, description="Máximo de PRs abiertas a analizar")
    order: Literal["recent", "oldest"] = Field(
        "recent",
        description="Qué PRs analizar si hay más que max_prs: 'recent' = actividad más reciente, "
        "'oldest' = las abiertas hace más tiempo",
    )
    spoken_top: int = Field(5, ge=1, le=10, description="Cuántas PRs se mencionan en el audio")
    include_audio: bool = True

    @field_validator("repo")
    @classmethod
    def normalize_repo(cls, v: str) -> str:
        m = _REPO_RE.match(v.strip())
        if not m:
            raise ValueError("Formato de repo no válido: usa 'owner/name' o la URL de GitHub")
        return f"{m.group(1)}/{m.group(2)}"


PriorityLevel = Literal["alta", "media", "baja"]
Status = Literal[
    "listo_para_merge",
    "necesita_revision",
    "cambios_solicitados",
    "ci_fallando",
    "conflictos",
    "borrador",
    "en_curso",
]


class PRInfo(BaseModel):
    number: int
    title: str
    url: str
    author: str
    draft: bool
    labels: list[str]
    created_at: str
    updated_at: str
    age_days: int
    idle_days: int
    additions: int | None = None
    deletions: int | None = None
    changed_files: int | None = None
    review_state: Literal["approved", "changes_requested", "commented", "none"] = "none"
    ci_state: Literal["success", "failure", "pending", "none"] = "none"
    mergeable_state: str | None = None
    requested_reviewers: list[str] = []


class PriorityReason(BaseModel):
    reason: str
    points: int


class PrioritizedPR(BaseModel):
    pr: PRInfo
    score: int
    level: PriorityLevel
    status: Status
    next_action: str
    reasons: list[PriorityReason]


class StandupResponse(BaseModel):
    repo: str
    generated_at: str
    total_open: int = Field(..., description="PRs abiertas en el repo (total real)")
    analyzed: int = Field(..., description="PRs analizadas (según order y max_prs)")
    order: Literal["recent", "oldest"] = Field(..., description="Criterio usado para elegir las PRs analizadas")
    style: Style = Field(..., description="Formato del locutor usado en el resumen y el audio")
    counts: dict[str, int] = Field(..., description="Recuentos sobre las PRs analizadas")
    summary: str
    prs: list[PrioritizedPR]
    audio_base64: str | None = None
    audio_mime: str | None = None
    audio_error: str | None = None
