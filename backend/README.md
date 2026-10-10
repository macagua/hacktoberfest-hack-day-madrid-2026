# Backend: PR Stand-up (FastAPI)

Lee las pull requests abiertas de un repo de GitHub, las prioriza con reglas explicables, genera un resumen pensado para escucharse y lo convierte a voz con ElevenLabs.

## Arrancar

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
cp .env.example .env        # y rellena GITHUB_TOKEN y ELEVENLABS_API_KEY
uvicorn app.main:app --reload --port 8000
```

Documentación interactiva: http://localhost:8000/docs

Tests (sin red, GitHub y ElevenLabs simulados): `pytest -q`

## Endpoints

### `POST /standup`

```json
{
  "repo": "macagua/hacktoberfest-hack-day-madrid-2026",
  "lang": "es",
  "max_prs": 30,
  "spoken_top": 5,
  "include_audio": true
}
```

`repo` acepta `owner/name` o la URL completa de GitHub. Solo `repo` es obligatorio.

Respuesta (resumida):

```json
{
  "repo": "acme/demo",
  "generated_at": "2026-10-10T15:30:00+00:00",
  "total_open": 3,
  "counts": { "alta": 1, "media": 1, "baja": 1, "ci_fallando": 1, "listo_para_merge": 1, "borrador": 1 },
  "summary": "Buenas. Resumen del repositorio demo. Hay 3 pull requests abiertas...",
  "prs": [
    {
      "pr": { "number": 1, "title": "Fix login crash", "url": "...", "author": "ana",
              "draft": false, "labels": ["bug"], "age_days": 9, "idle_days": 8,
              "additions": 20, "deletions": 5, "changed_files": 2,
              "review_state": "none", "ci_state": "failure", "mergeable_state": "unstable",
              "requested_reviewers": ["bob"] },
      "score": 73,
      "level": "alta",
      "status": "ci_fallando",
      "next_action": "Arreglar los checks que fallan",
      "reasons": [
        { "reason": "Esperando revisión desde hace 9 días", "points": 28 },
        { "reason": "Etiqueta importante: bug", "points": 20 },
        { "reason": "Los checks de CI están fallando", "points": 20 }
      ]
    }
  ],
  "audio_base64": "SUQz...",
  "audio_mime": "audio/mpeg",
  "audio_error": null
}
```

- `prs` viene ya ordenado de mayor a menor prioridad.
- `level`: `alta` (≥45 puntos), `media` (≥20) o `baja`.
- `status`: `listo_para_merge`, `necesita_revision`, `cambios_solicitados`, `ci_fallando`, `conflictos`, `borrador`, `en_curso`.
- Si ElevenLabs falla, la respuesta llega igual con el análisis, `audio_base64: null` y el motivo en `audio_error`.

Errores: `404` repo no encontrado, `422` formato de repo no válido, `429` límite de GitHub agotado, `502` otro fallo de GitHub.

### `GET /health`

Indica si están configurados el token de GitHub y la clave de ElevenLabs.

## Para el front (React)

```jsx
const res = await fetch("http://localhost:8000/standup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ repo }),
});
const data = await res.json();
if (data.audio_base64) {
  new Audio(`data:${data.audio_mime};base64,${data.audio_base64}`).play();
}
```

## Cómo se prioriza

| Regla | Puntos |
|---|---|
| Etiqueta urgente (`security`, `critical`, `urgent`, `hotfix`, `p0`, `blocker`) | +35 |
| Etiqueta importante (`bug`, `p1`, `regression`…) | +20 |
| Aprobada, CI en verde y sin conflictos | +25 |
| CI fallando | +20 |
| Esperando revisión | +10, más 2 por día abierta (máx. +28) |
| Conflictos con la rama base | +10 |
| Cambios solicitados | +10 |
| Sin actividad ≥ 7 días | +10 |
| Pequeña (≤ 50 líneas) | +5 |
| Muy grande (> 800 líneas) | −5 |
| Borrador | −40 |

Las reglas están en `app/priority.py` y se pueden ajustar sin tocar el resto.

## Notas

- Sin `GITHUB_TOKEN`, GitHub permite 60 peticiones por hora y cada PR gasta unas 4, así que con el token os ahorráis sustos en la demo.
- El resumen es por plantillas (rápido, gratis y predecible). Si queréis un resumen redactado por un LLM, se puede sustituir `build_summary` sin cambiar el contrato de la API.
