# Backend: PR Stand-up (FastAPI)

Lee las pull requests abiertas de un repo de GitHub, las prioriza con reglas explicables, genera un resumen pensado para escucharse y lo convierte a voz con ElevenLabs, con distintos formatos de locutor (radio, fútbol, documental).

## Estructura del código

```
app/
├── main.py       # API: endpoints y orquestación
├── config.py     # Configuración desde variables de entorno
├── schemas.py    # Modelos de entrada y salida (contrato con el front)
├── github.py     # Lectura de PRs desde la API de GitHub
├── priority.py   # Reglas de prioridad
├── narration.py  # Guiones del locutor (radio, fútbol, documental, neutro)
└── voice.py      # Texto a voz con ElevenLabs
```

- **`main.py`**: crea la app de FastAPI, configura CORS y define los endpoints `GET /health` y `POST /standup`. Este último coordina el flujo completo: pide las PRs a GitHub, las prioriza, genera el guion y, si se pide, el audio. Si ElevenLabs falla, devuelve igualmente el análisis con el motivo en `audio_error`.
- **`config.py`**: lee la configuración del `.env` (tokens de GitHub y ElevenLabs, voz general y voces por formato, modelo, formato de audio y orígenes permitidos para CORS) sin dependencias extra. Las variables definidas en la terminal tienen prioridad sobre el `.env`.
- **`schemas.py`**: modelos de Pydantic que definen el contrato de la API. `StandupRequest` valida la petición y normaliza el repo (acepta `owner/name` o la URL de GitHub); `StandupResponse`, `PrioritizedPR` y `PRInfo` describen la respuesta que consume el front.
- **`github.py`**: cliente asíncrono con httpx. Obtiene el total real de PRs abiertas y, según `order`, las que se van a analizar; para cada una pide en paralelo su detalle (tamaño y conflictos), sus revisiones y el estado del CI. Traduce los errores de GitHub (repo inexistente, token inválido, límite agotado) a respuestas HTTP claras.
- **`priority.py`**: puntúa cada PR con reglas explicables (etiquetas urgentes, CI fallando, días esperando revisión, lista para merge, tamaño, borrador…) y guarda el motivo de cada punto. Asigna nivel, estado y siguiente acción, y ordena las PRs. Para ajustar la priorización, este es el único archivo que hay que tocar.
- **`narration.py`**: redacta el guion hablado en español o inglés según el formato del locutor (`radio`, `futbol`, `documental` o `neutro`) y define cómo suena la voz en cada uno (expresividad y velocidad). Para añadir un formato nuevo, basta con añadir su guion y su perfil de voz aquí y su nombre en `schemas.py`.
- **`voice.py`**: convierte el guion en audio con el SDK asíncrono de ElevenLabs, usando la voz y el perfil de voz del formato elegido, el modelo y el formato de audio configurados.

Los tests de `tests/test_standup.py` simulan GitHub y ElevenLabs, así que se ejecutan sin red ni claves.

## Arrancar

Todo se gestiona con [uv](https://docs.astral.sh/uv/) a partir de `pyproject.toml` y `uv.lock`.

```bash
cd backend
uv sync                      # crea .venv con Python 3.12 e instala todo (incluye pytest)
cp .env.example .env         # y rellena GITHUB_TOKEN y ELEVENLABS_API_KEY
uv run fastapi dev app/main.py   # arranca en http://localhost:8000 con recarga automática
```

Documentación interactiva: http://localhost:8000/docs

Tests (sin red, GitHub y ElevenLabs simulados): `uv run pytest -q`

Añadir dependencias: `uv add <paquete>` (o `uv add --dev <paquete>` para herramientas de desarrollo). Subid siempre `uv.lock` junto con `pyproject.toml`.

La recarga automática solo detecta cambios en los `.py`: si cambias el `.env`, reinicia el servidor.

## Endpoints

### `POST /standup`

```json
{
  "repo": "macagua/hacktoberfest-hack-day-madrid-2026",
  "lang": "es",
  "style": "radio",
  "max_prs": 30,
  "order": "recent",
  "spoken_top": 5,
  "include_audio": true
}
```

Solo `repo` es obligatorio.

| Campo | Valores | Por defecto | Para qué |
|---|---|---|---|
| `repo` | `owner/name` o URL de GitHub | (obligatorio) | Repo a analizar |
| `lang` | `es`, `en` | `es` | Idioma del guion y los motivos |
| `style` | `radio`, `futbol`, `documental`, `neutro` | `radio` | Formato del locutor |
| `max_prs` | 1 a 100 | 30 | Cuántas PRs analizar |
| `order` | `recent`, `oldest` | `recent` | Qué PRs analizar si hay más que `max_prs` |
| `spoken_top` | 1 a 10 | 5 | Cuántas PRs menciona el audio |
| `include_audio` | `true`, `false` | `true` | Generar el audio (gasta créditos de ElevenLabs) |

#### Formatos de locutor (`style`)

Cambian tanto el guion como la forma de hablar (expresividad y velocidad), y cada formato puede tener su propia voz (ver `.env.example`):

| Valor | Locutor | Ejemplo |
|---|---|---|
| `radio` | Programa matinal de radio o podcast | "¡Buenos días, buenos días! Bienvenidos al stand-up de…" |
| `futbol` | Narrador de partido | "¡Tarjeta amarilla! ¡El CI está en rojo!" |
| `documental` | Narrador de documental de naturaleza | "Espera, inmóvil, a que un revisor se acerque." |
| `neutro` | Resumen sobrio, sin personaje | "Número 12, Fix login, de ana. Revisarla." |

#### Qué PRs se analizan (`order`)

| Valor | Analiza | Útil para |
|---|---|---|
| `recent` | Las de actividad más reciente | El día a día: lo que se está moviendo ahora |
| `oldest` | Las abiertas hace más tiempo | Rescatar PRs viejas y olvidadas |

#### Respuesta (resumida)

```json
{
  "repo": "acme/demo",
  "generated_at": "2026-10-10T15:30:00+00:00",
  "total_open": 321,
  "analyzed": 3,
  "order": "recent",
  "style": "radio",
  "counts": { "alta": 1, "media": 1, "baja": 1, "ci_fallando": 1, "listo_para_merge": 1, "borrador": 1 },
  "summary": "¡Buenos días, buenos días! Bienvenidos al stand-up de demo. Hay 321 pull requests abiertas y hoy repasamos las 3 con actividad más reciente...",
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

- `total_open` es el total real de PRs abiertas del repo; `analyzed`, cuántas se han analizado (según `order` y `max_prs`). `prs` y `counts` se refieren solo a las analizadas.
- `prs` viene ya ordenado de mayor a menor prioridad.
- `level`: `alta` (≥45 puntos), `media` (≥20) o `baja`.
- `status`: `listo_para_merge`, `necesita_revision`, `cambios_solicitados`, `ci_fallando`, `conflictos`, `borrador`, `en_curso`.
- Si ElevenLabs falla, la respuesta llega igual con el análisis, `audio_base64: null` y el motivo en `audio_error`.

Errores: `404` repo no encontrado, `422` petición no válida (repo, `style` u `order` incorrectos), `429` límite de GitHub agotado, `502` otro fallo de GitHub.

### `GET /health`

Indica si están configurados el token de GitHub y la clave de ElevenLabs.

## Para el front (React)

```jsx
const res = await fetch("http://localhost:8000/standup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ repo, style: "futbol", order: "recent" }),
});
const data = await res.json();
if (data.audio_base64) {
  new Audio(`data:${data.audio_mime};base64,${data.audio_base64}`).play();
}
```

Los navegadores bloquean el audio automático sin un clic previo del usuario, así que conviene lanzar `play()` desde un botón.

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

## Probar sin front

Con el servidor arrancado (`uv run fastapi dev app/main.py`), en otra terminal:

```bash
# 1. Comprobar que se leen las claves (esperado: los tres valores en true)
curl http://localhost:8000/health

# 2. Análisis sin audio (no gasta créditos de ElevenLabs)
# 2.1 FastAPI
curl -s -X POST http://localhost:8000/standup \
  -H "Content-Type: application/json" \
  -d '{"repo": "fastapi/fastapi", "max_prs": 10, "include_audio": false}' \
  | uv run python -m json.tool

# 2.2 Netbird
curl -s -X POST http://localhost:8000/standup \
  -H "Content-Type: application/json" \
  -d '{"repo": "https://github.com/netbirdio/netbird", "max_prs": 10, "include_audio": false}' \
  | uv run python -m json.tool

# 2.3 Repo del proyecto
curl -s -X POST http://localhost:8000/standup \
  -H "Content-Type: application/json" \
  -d '{"repo": "https://github.com/macagua/hacktoberfest-hack-day-madrid-2026", "max_prs": 10, "include_audio": false}' \
  | uv run python -m json.tool

# 2.4 Netbird, las PRs más antiguas
curl -s -X POST http://localhost:8000/standup \
  -H "Content-Type: application/json" \
  -d '{"repo": "https://github.com/netbirdio/netbird", "max_prs": 10, "order": "oldest", "include_audio": false}' \
  | uv run python -m json.tool

# 3. Comparar el guion de los formatos de locutor (solo texto, no gasta créditos)
for style in radio futbol documental neutro; do
  echo "--- $style"
  curl -s -X POST http://localhost:8000/standup \
    -H "Content-Type: application/json" \
    -d "{\"repo\": \"netbirdio/netbird\", \"max_prs\": 10, \"style\": \"$style\", \"include_audio\": false}" \
    | uv run python -c "import sys,json; print(json.load(sys.stdin)['summary'])"
done

# 4. Con audio, guardado en un mp3
# 4.1 Netbird, formato radio → standup.mp3
curl -s -X POST http://localhost:8000/standup \
  -H "Content-Type: application/json" \
  -d '{"repo": "https://github.com/netbirdio/netbird", "max_prs": 10, "spoken_top": 3}' \
  | uv run python -c "import sys,json,base64; d=json.load(sys.stdin); print(d['audio_error'] or 'OK'); d['audio_base64'] and open('standup.mp3','wb').write(base64.b64decode(d['audio_base64']))"

# 4.2 Repo del proyecto, formato radio → standup-proyecto.mp3
curl -s -X POST http://localhost:8000/standup \
  -H "Content-Type: application/json" \
  -d '{"repo": "https://github.com/macagua/hacktoberfest-hack-day-madrid-2026", "max_prs": 10, "spoken_top": 3}' \
  | uv run python -c "import sys,json,base64; d=json.load(sys.stdin); print(d['audio_error'] or 'OK'); d['audio_base64'] and open('standup-proyecto.mp3','wb').write(base64.b64decode(d['audio_base64']))"

# 4.3 Netbird en los tres formatos de locutor → standup-radio.mp3, standup-futbol.mp3, standup-documental.mp3
#     (gasta créditos: tres audios)
for style in radio futbol documental; do
  curl -s -X POST http://localhost:8000/standup \
    -H "Content-Type: application/json" \
    -d "{\"repo\": \"netbirdio/netbird\", \"max_prs\": 10, \"spoken_top\": 3, \"style\": \"$style\"}" \
    | uv run python -c "import sys,json,base64; d=json.load(sys.stdin); print('$style:', d['audio_error'] or 'OK'); d['audio_base64'] and open('standup-$style.mp3','wb').write(base64.b64decode(d['audio_base64']))"
done

# 5. Casos de error
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/standup \
  -H "Content-Type: application/json" -d '{"repo": "nadie/noexiste", "include_audio": false}'   # 404
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/standup \
  -H "Content-Type: application/json" -d '{"repo": "esto no es un repo"}'                       # 422
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/standup \
  -H "Content-Type: application/json" -d '{"repo": "fastapi/fastapi", "style": "telenovela"}'   # 422
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/standup \
  -H "Content-Type: application/json" -d '{"repo": "fastapi/fastapi", "order": "random"}'       # 422
```

También se puede probar desde el navegador en http://localhost:8000/docs: despliega `POST /standup`, pulsa **Try it out**, escribe el repo (y, si quieres, `style` y `order`) y dale a **Execute**.

### Si algo falla

| Síntoma | Causa probable |
|---|---|
| `/health` devuelve algún `false` | El `.env` no está en la carpeta desde la que arrancas el servidor, o esa clave está vacía |
| `401` "GITHUB_TOKEN no válido" | Token mal copiado, caducado o con el valor de ejemplo; o hay un `GITHUB_TOKEN` en la terminal que tiene prioridad sobre el `.env` |
| `502` con "GitHub respondió 403" | El token no tiene acceso al repo o la organización no lo ha aprobado |
| `429` | Límite de GitHub agotado: configura `GITHUB_TOKEN` |
| El paso 4 imprime un error en vez de `OK` | Problema con la clave, la voz o los créditos de ElevenLabs (el mensaje dice cuál) |

## Notas

- Sin `GITHUB_TOKEN`, GitHub permite 60 peticiones por hora y cada PR gasta unas 4, así que con el token os ahorráis sustos en la demo.
- Para gastar menos créditos durante el desarrollo, usad `ELEVENLABS_MODEL_ID=eleven_flash_v2_5`; para la demo, `eleven_multilingual_v2` suena más natural.
- El guion es por plantillas (rápido, gratis y predecible). Si queréis un guion redactado por un LLM, se puede sustituir `build_summary` en `app/narration.py` sin cambiar el contrato de la API.
