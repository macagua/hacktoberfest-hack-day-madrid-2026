"""Guiones hablados del stand-up: un locutor distinto para cada estilo.

Cada estilo define:
- los textos del guion (intro, una frase por PR, cierre), en español e inglés;
- cómo describe cada estado de una PR (en fútbol, una PR con CI fallando es una tarjeta amarilla);
- cómo debe sonar la voz (VOICE_PROFILES): más o menos expresiva y rápida.

Los textos están pensados para escucharse: frases cortas, sin URLs ni símbolos.
Para añadir un estilo nuevo basta con añadir su entrada en SCRIPTS y VOICE_PROFILES
y su nombre en el Literal `Style` de schemas.py.
"""

import re

from .priority import T as REASON_TEXTS
from .priority import counts
from .schemas import PrioritizedPR

# Motivo que ya está implícito en cada estado: no lo repetimos tras la frase del locutor.
_STATUS_REASON_KEY = {
    "ci_fallando": "ci_failure",
    "listo_para_merge": "ready",
    "conflictos": "conflicts",
    "cambios_solicitados": "changes_requested",
    "borrador": "draft",
}

# Ajustes de voz de ElevenLabs por estilo (0 a 1, salvo speed: 0.7 a 1.2).
# Menos stability = más expresiva; más style = más exagerada.
VOICE_PROFILES: dict[str, dict] = {
    "neutro": {"stability": 0.6, "similarity_boost": 0.75, "style": 0.0, "speed": 1.0},
    "radio": {"stability": 0.4, "similarity_boost": 0.75, "style": 0.45, "speed": 1.05},
    "futbol": {"stability": 0.25, "similarity_boost": 0.7, "style": 0.75, "speed": 1.15},
    "documental": {"stability": 0.75, "similarity_boost": 0.8, "style": 0.2, "speed": 0.9},
}

SCRIPTS: dict[str, dict[str, dict]] = {
    "neutro": {
        "es": {
            "none": "Buenas. El repositorio {repo} no tiene pull requests abiertas. Día tranquilo.",
            "intro": "Buenas. Resumen del repositorio {repo}. Hay {total} pull requests abiertas: {high} de prioridad alta, {mid} media y {low} baja.",
            "intro_partial": "Buenas. Resumen del repositorio {repo}. Hay {total} pull requests abiertas. He analizado las {analyzed} {scope}: {high} de prioridad alta, {mid} media y {low} baja.",
            "ready_count": " {n} están listas para merge.",
            "ready_count_one": " Una está lista para merge.",
            "first": "Por orden de prioridad.",
            "item": "Número {number}, {title}, de {author}. {action}. {reason}.",
            "rest": "Y {n} más en el panel.",
            "rest_one": "Y una más en el panel.",
            "outro": "Eso es todo. A por ello.",
        },
        "en": {
            "none": "Hi. The repository {repo} has no open pull requests. Quiet day.",
            "intro": "Hi. Stand-up for {repo}. There are {total} open pull requests: {high} high priority, {mid} medium and {low} low.",
            "intro_partial": "Hi. Stand-up for {repo}. There are {total} open pull requests. I analyzed the {analyzed} {scope}: {high} high priority, {mid} medium and {low} low.",
            "ready_count": " {n} are ready to merge.",
            "ready_count_one": " One is ready to merge.",
            "first": "In order of priority.",
            "item": "Number {number}, {title}, by {author}. {action}. {reason}.",
            "rest": "And {n} more on the dashboard.",
            "rest_one": "And one more on the dashboard.",
            "outro": "That's all. Let's go.",
        },
    },
    "radio": {
        "es": {
            "none": "¡Buenos días, buenos días! Aquí el stand-up de {repo}, y hoy la cosa está tranquila: ni una sola pull request abierta. ¡Disfrutad del café!",
            "intro": "¡Buenos días, buenos días! Bienvenidos al stand-up de {repo}. Hoy tenemos {total} pull requests en antena: {high} de prioridad alta, {mid} media y {low} baja.",
            "intro_partial": "¡Buenos días, buenos días! Bienvenidos al stand-up de {repo}. Hay {total} pull requests abiertas y hoy repasamos las {analyzed} {scope}: {high} de prioridad alta, {mid} media y {low} baja.",
            "ready_count": " ¡Y ojo, que {n} ya están listas para merge!",
            "ready_count_one": " ¡Y ojo, que una ya está lista para merge!",
            "first": "Vamos con los titulares.",
            "item": "Ahora, la número {number}: {title}, de {author}. {status_line} {reason}.",
            "rest": "Y tenemos {n} más esperando en el panel.",
            "rest_one": "Y tenemos una más esperando en el panel.",
            "outro": "Hasta aquí el stand-up de hoy. ¡Feliz código y nos escuchamos mañana!",
            "status": {
                "listo_para_merge": "¡Lista para merge, alguien que le dé al botón!",
                "necesita_revision": "Busca a alguien que la revise.",
                "cambios_solicitados": "Le han pedido cambios, la pelota está en el tejado del autor.",
                "ci_fallando": "Malas noticias: el CI está en rojo.",
                "conflictos": "Tiene conflictos que resolver con la rama base.",
                "borrador": "Todavía es un borrador.",
                "en_curso": "Sigue en marcha.",
            },
        },
        "en": {
            "none": "Good morning, good morning! This is the {repo} stand-up, and it's a quiet one: no open pull requests at all. Enjoy your coffee!",
            "intro": "Good morning, good morning! Welcome to the {repo} stand-up. We've got {total} pull requests on air today: {high} high priority, {mid} medium and {low} low.",
            "intro_partial": "Good morning, good morning! Welcome to the {repo} stand-up. There are {total} open pull requests and today we're covering the {analyzed} {scope}: {high} high priority, {mid} medium and {low} low.",
            "ready_count": " And heads up: {n} are ready to merge!",
            "ready_count_one": " And heads up: one is ready to merge!",
            "first": "Let's go to the headlines.",
            "item": "Up next, number {number}: {title}, by {author}. {status_line} {reason}.",
            "rest": "And {n} more waiting on the dashboard.",
            "rest_one": "And one more waiting on the dashboard.",
            "outro": "That's it for today's stand-up. Happy coding, and talk to you tomorrow!",
            "status": {
                "listo_para_merge": "Ready to merge, somebody hit that button!",
                "necesita_revision": "It's looking for a reviewer.",
                "cambios_solicitados": "Changes were requested, so the ball is in the author's court.",
                "ci_fallando": "Bad news: CI is red.",
                "conflictos": "It has conflicts with the base branch.",
                "borrador": "Still a draft.",
                "en_curso": "Still in progress.",
            },
        },
    },
    "futbol": {
        "es": {
            "none": "¡Pitido inicial en {repo}! Pero… ¡no hay nadie en el campo! Cero pull requests abiertas. ¡Partido suspendido por falta de jugadores!",
            "intro": "¡Muy buenas, aficionados! ¡Arranca el partido en el estadio {repo}! Hay {total} pull requests sobre el césped: {high} de prioridad alta, {mid} media y {low} baja.",
            "intro_partial": "¡Muy buenas, aficionados! ¡Arranca el partido en el estadio {repo}! Hay {total} pull requests en la convocatoria, y saltan al campo las {analyzed} {scope}: {high} de prioridad alta, {mid} media y {low} baja.",
            "ready_count": " ¡Y atención, que {n} están solas delante de la portería!",
            "ready_count_one": " ¡Y atención, que hay una sola delante de la portería!",
            "first": "¡Rueda el balón!",
            "item": "¡Atención, atención! ¡La número {number}, {title}, de {author}! {status_line} {reason}.",
            "rest": "¡Y otras {n} calientan en la banda!",
            "rest_one": "¡Y otra más calienta en la banda!",
            "outro": "¡Final del partido! ¡Nos vemos en la próxima jornada!",
            "status": {
                "listo_para_merge": "¡Está sola delante de la portería! ¡Solo falta empujarla! ¡Merge, merge, merge!",
                "necesita_revision": "¡Pide el balón y nadie se lo pasa! ¡Necesita un revisor!",
                "cambios_solicitados": "¡El árbitro señala y pide cambios!",
                "ci_fallando": "¡Tarjeta amarilla! ¡El CI está en rojo!",
                "conflictos": "¡Fuera de juego! ¡Conflictos con la rama base!",
                "borrador": "¡Todavía está calentando en la banda!",
                "en_curso": "¡Sigue la jugada!",
            },
        },
        "en": {
            "none": "Kick-off at {repo}! But… there's nobody on the pitch! Zero open pull requests. Match called off for lack of players!",
            "intro": "Hello and welcome, football fans! Kick-off at {repo} stadium! There are {total} pull requests on the pitch: {high} high priority, {mid} medium and {low} low.",
            "intro_partial": "Hello and welcome, football fans! Kick-off at {repo} stadium! There are {total} pull requests in the squad, and the {analyzed} {scope} take the field: {high} high priority, {mid} medium and {low} low.",
            "ready_count": " And watch out, {n} are one-on-one with the keeper!",
            "ready_count_one": " And watch out, one is one-on-one with the keeper!",
            "first": "Here we go!",
            "item": "Look at this! Number {number}, {title}, by {author}! {status_line} {reason}.",
            "rest": "And {n} more warming up on the bench!",
            "rest_one": "And one more warming up on the bench!",
            "outro": "Full time! See you next match day!",
            "status": {
                "listo_para_merge": "It's one-on-one with the keeper! Just tap it in! Merge, merge, merge!",
                "necesita_revision": "Calling for the ball and nobody passes! It needs a reviewer!",
                "cambios_solicitados": "The referee points and asks for changes!",
                "ci_fallando": "Yellow card! CI is red!",
                "conflictos": "Offside! Conflicts with the base branch!",
                "borrador": "Still warming up on the sidelines!",
                "en_curso": "Play goes on!",
            },
        },
    },
    "documental": {
        "es": {
            "none": "En el repositorio {repo} reina el silencio. No hay una sola pull request abierta. Un ecosistema en perfecto equilibrio.",
            "intro": "En las profundidades del repositorio {repo} habitan {total} pull requests. Unas reclaman atención urgente, otras esperan con paciencia: {high} de prioridad alta, {mid} media y {low} baja.",
            "intro_partial": "En las profundidades del repositorio {repo} habitan {total} pull requests. Hoy observaremos a las {analyzed} {scope}. Unas reclaman atención urgente, otras esperan con paciencia: {high} de prioridad alta, {mid} media y {low} baja.",
            "ready_count": " {n} han completado su ciclo y están listas para unirse a la rama principal.",
            "ready_count_one": " Una de ellas ha completado su ciclo y está lista para unirse a la rama principal.",
            "first": "Acerquémonos con cuidado.",
            "item": "He aquí la número {number}, {title}. Su autor, {author}, la observa desde la distancia. {status_line} {reason}.",
            "rest": "Otras {n} permanecen ocultas entre la maleza del panel.",
            "rest_one": "Otra más permanece oculta entre la maleza del panel.",
            "outro": "Y así, el ciclo del código continúa.",
            "status": {
                "listo_para_merge": "Ha alcanzado la madurez. Solo espera el momento de unirse a la rama principal.",
                "necesita_revision": "Espera, inmóvil, a que un revisor se acerque.",
                "cambios_solicitados": "La manada le ha pedido que cambie antes de aceptarla.",
                "ci_fallando": "Algo no va bien. Sus pruebas fallan una y otra vez.",
                "conflictos": "Compite por el mismo territorio que la rama base.",
                "borrador": "Aún se está formando, protegida en su borrador.",
                "en_curso": "Sigue su camino, a su propio ritmo.",
            },
        },
        "en": {
            "none": "In the {repo} repository, silence reigns. Not a single open pull request. An ecosystem in perfect balance.",
            "intro": "Deep within the {repo} repository live {total} pull requests. Some demand urgent attention, others wait patiently: {high} high priority, {mid} medium and {low} low.",
            "intro_partial": "Deep within the {repo} repository live {total} pull requests. Today we observe the {analyzed} {scope}. Some demand urgent attention, others wait patiently: {high} high priority, {mid} medium and {low} low.",
            "ready_count": " {n} have completed their life cycle and are ready to join the main branch.",
            "ready_count_one": " One of them has completed its life cycle and is ready to join the main branch.",
            "first": "Let us approach carefully.",
            "item": "Here we find number {number}, {title}. Its author, {author}, watches from a distance. {status_line} {reason}.",
            "rest": "Another {n} remain hidden in the undergrowth of the dashboard.",
            "rest_one": "One more remains hidden in the undergrowth of the dashboard.",
            "outro": "And so, the cycle of code continues.",
            "status": {
                "listo_para_merge": "It has reached maturity. It only awaits the moment to join the main branch.",
                "necesita_revision": "It waits, motionless, for a reviewer to approach.",
                "cambios_solicitados": "The herd has asked it to change before accepting it.",
                "ci_fallando": "Something is wrong. Its tests fail again and again.",
                "conflictos": "It competes for the same territory as the base branch.",
                "borrador": "Still forming, sheltered in its draft.",
                "en_curso": "It goes its own way, at its own pace.",
            },
        },
    },
}

SCOPE = {
    "es": {"recent": "con actividad más reciente", "oldest": "más antiguas"},
    "en": {"recent": "most recently active", "oldest": "oldest"},
}


def build_summary(
    repo: str,
    ranked: list[PrioritizedPR],
    lang: str = "es",
    spoken_top: int = 5,
    total_open: int | None = None,
    order: str = "recent",
    style: str = "neutro",
) -> str:
    t = SCRIPTS[style][lang]
    repo_spoken = repo.split("/")[-1].replace("-", " ").replace("_", " ")
    if not ranked:
        return t["none"].format(repo=repo_spoken)

    c = counts(ranked)
    total = max(total_open or 0, len(ranked))
    intro = t["intro_partial"] if total > len(ranked) else t["intro"]
    parts = [
        intro.format(
            repo=repo_spoken,
            total=total,
            analyzed=len(ranked),
            scope=SCOPE[lang][order],
            high=c["alta"],
            mid=c["media"],
            low=c["baja"],
        )
    ]
    if c.get("listo_para_merge"):
        parts[-1] += _plural(t, "ready_count", c["listo_para_merge"])

    # En voz no mencionamos borradores salvo que no haya otra cosa
    speakable = [p for p in ranked if p.status != "borrador"] or ranked
    top = speakable[:spoken_top]
    parts.append(t["first"])
    for p in top:
        parts.append(
            t["item"].format(
                number=p.pr.number,
                title=p.pr.title.strip().rstrip("."),
                author=p.pr.author,
                action=p.next_action,
                status_line=t.get("status", {}).get(p.status, ""),
                reason=_extra_reason(p, lang),
            )
        )
    if len(ranked) > len(top):
        parts.append(_plural(t, "rest", len(ranked) - len(top)))
    parts.append(t["outro"])
    text = " ".join(parts)
    # Limpieza por si algún hueco quedó vacío ("…botón! ." → "…botón!")
    text = re.sub(r"\s+\.", "", text)
    return re.sub(r"\s{2,}", " ", text).strip()


def _plural(t: dict, key: str, n: int) -> str:
    return t[f"{key}_one"] if n == 1 and f"{key}_one" in t else t[key].format(n=n)


def _extra_reason(p: PrioritizedPR, lang: str) -> str:
    """Motivo principal que aporta algo nuevo respecto al estado ya narrado."""
    redundant = _STATUS_REASON_KEY.get(p.status)
    redundant_text = REASON_TEXTS[lang][redundant] if redundant else None
    for r in p.reasons:
        if r.reason != redundant_text and r.points > 0:
            return r.reason
    return ""
