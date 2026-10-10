"""Priorización de PRs por reglas explicables.

Cada regla suma o resta puntos y deja un motivo legible, para que el front
pueda mostrar *por qué* una PR está arriba (no es una caja negra).
El guion hablado se genera en narration.py.
"""

from collections import Counter

from .schemas import PRInfo, PrioritizedPR, PriorityReason

URGENT_LABELS = {"security", "critical", "urgent", "hotfix", "p0", "blocker", "seguridad", "urgente"}
IMPORTANT_LABELS = {"bug", "p1", "regression", "high-priority", "high priority", "error"}

T = {
    "es": {
        "urgent_label": "Etiqueta urgente: {label}",
        "important_label": "Etiqueta importante: {label}",
        "ci_failure": "Los checks de CI están fallando",
        "conflicts": "Tiene conflictos con la rama base",
        "changes_requested": "Se han pedido cambios en la revisión",
        "ready": "Aprobada y con CI en verde: lista para merge",
        "needs_review": "Esperando revisión desde hace {days} días",
        "idle": "Sin actividad desde hace {days} días",
        "small": "Pequeña ({lines} líneas): revisión rápida",
        "large": "Muy grande ({lines} líneas): conviene dividirla",
        "draft": "Es un borrador",
        "action": {
            "borrador": "Esperar a que el autor la marque como lista",
            "ci_fallando": "Arreglar los checks que fallan",
            "conflictos": "Resolver los conflictos con la rama base",
            "cambios_solicitados": "El autor debe aplicar los cambios pedidos",
            "listo_para_merge": "Hacer merge",
            "necesita_revision": "Revisarla",
            "en_curso": "Seguir el progreso",
        },
    },
    "en": {
        "urgent_label": "Urgent label: {label}",
        "important_label": "Important label: {label}",
        "ci_failure": "CI checks are failing",
        "conflicts": "Has merge conflicts with the base branch",
        "changes_requested": "Changes were requested in review",
        "ready": "Approved with green CI: ready to merge",
        "needs_review": "Waiting for review for {days} days",
        "idle": "No activity for {days} days",
        "small": "Small ({lines} lines): quick review",
        "large": "Very large ({lines} lines): consider splitting it",
        "draft": "It's a draft",
        "action": {
            "borrador": "Wait until the author marks it ready",
            "ci_fallando": "Fix the failing checks",
            "conflictos": "Resolve the conflicts with the base branch",
            "cambios_solicitados": "The author needs to address the requested changes",
            "listo_para_merge": "Merge it",
            "necesita_revision": "Review it",
            "en_curso": "Keep an eye on it",
        },
    },
}


def score_pr(pr: PRInfo, lang: str = "es") -> PrioritizedPR:
    t = T[lang]
    reasons: list[PriorityReason] = []

    def add(points: int, text: str) -> None:
        reasons.append(PriorityReason(reason=text, points=points))

    labels = {lbl.lower() for lbl in pr.labels}
    for lbl in sorted(labels & URGENT_LABELS):
        add(35, t["urgent_label"].format(label=lbl))
    for lbl in sorted(labels & IMPORTANT_LABELS):
        add(20, t["important_label"].format(label=lbl))

    conflicts = pr.mergeable_state == "dirty"
    ready = (
        not pr.draft
        and pr.review_state == "approved"
        and pr.ci_state in ("success", "none")
        and not conflicts
    )

    if pr.ci_state == "failure":
        add(20, t["ci_failure"])
    if conflicts:
        add(10, t["conflicts"])
    if pr.review_state == "changes_requested":
        add(10, t["changes_requested"])
    if ready:
        add(25, t["ready"])
    if not pr.draft and pr.review_state in ("none", "commented"):
        add(10 + min(pr.age_days, 14) * 2, t["needs_review"].format(days=pr.age_days))
    if pr.idle_days >= 7:
        add(10, t["idle"].format(days=pr.idle_days))

    if pr.additions is not None and pr.deletions is not None:
        lines = pr.additions + pr.deletions
        if lines <= 50:
            add(5, t["small"].format(lines=lines))
        elif lines > 800:
            add(-5, t["large"].format(lines=lines))

    if pr.draft:
        add(-40, t["draft"])

    if pr.draft:
        status = "borrador"
    elif pr.ci_state == "failure":
        status = "ci_fallando"
    elif conflicts:
        status = "conflictos"
    elif pr.review_state == "changes_requested":
        status = "cambios_solicitados"
    elif ready:
        status = "listo_para_merge"
    elif pr.review_state in ("none", "commented"):
        status = "necesita_revision"
    else:
        status = "en_curso"

    score = sum(r.points for r in reasons)
    level = "alta" if score >= 45 else "media" if score >= 20 else "baja"
    reasons.sort(key=lambda r: r.points, reverse=True)

    return PrioritizedPR(
        pr=pr,
        score=score,
        level=level,
        status=status,
        next_action=t["action"][status],
        reasons=reasons,
    )


def prioritize(prs: list[PRInfo], lang: str = "es") -> list[PrioritizedPR]:
    ranked = [score_pr(pr, lang) for pr in prs]
    # Empate: la más antigua primero
    ranked.sort(key=lambda p: (-p.score, -p.pr.age_days, p.pr.number))
    return ranked


def counts(ranked: list[PrioritizedPR]) -> dict[str, int]:
    c = Counter(p.level for p in ranked)
    s = Counter(p.status for p in ranked)
    return {"alta": c["alta"], "media": c["media"], "baja": c["baja"], **{k: v for k, v in s.items()}}

