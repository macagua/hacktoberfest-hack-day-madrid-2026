# 🎙️ Standup FM — ElevenLabs & Gemma Demo

> **"El daily standup que nadie pidió y todo el mundo escuchará."**  
> Tu repositorio de GitHub narrado como un mini podcast por dos locutores de radio con IA.

Desarrollado por el equipo **"CTRL ALT ELITE"** para el **Hacktoberfest Hack Day Madrid 2026**.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![ElevenLabs](https://img.shields.io/badge/Voice-ElevenLabs%20Turbo%20v2.5-FF4A00)](https://elevenlabs.io/)
[![Google Gemma](https://img.shields.io/badge/LLM-Gemma%204-4285F4?logo=google&logoColor=white)](https://ai.google.dev/gemma)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)

---

## 📻 ¿Qué es Standup FM?

Revisar el backlog de Pull Requests suele ser una tarea repetitiva y tediosa. **Standup FM** transforma la actividad de un repositorio en un resumen sonoro dinámico, divertido y explicable, emulando un programa de radio en vivo en el dial **104.3 FM**.

1. **Lee y analiza** las Pull Requests abiertas de cualquier repositorio en GitHub.
2. **Prioriza con un sistema de puntuación explicable** (checks de CI caídos, revisiones bloqueadas, tamaño del código, antigüedad y etiquetas críticas).
3. **Sintetiza la narrativa con Gemma 4**, fonetizando términos técnicos y aplicando directrices de locución natural para radio sin formato markdown.
4. **Locuta en audio streaming con ElevenLabs**, generando voces realistas con latencia ultra-baja y reproductor interactivo con descarga en MP3.

---

## 🏛️ Arquitectura del Sistema

```mermaid
flowchart TD
    subgraph Frontend ["🎙️ Frontend (Standup FM Studio - React 19 + Vite)"]
        UI["UI / Dial 104.3 FM"]
        AudioPlayer["Reproductor de Audio & Descarga MP3"]
        PRDeck["Tarjetas de PRs Priorizadas & Explicación"]
    end

    subgraph Backend ["⚡ Backend (FastAPI + Async HTTP)"]
        API["FastAPI App (/standup, /tts, /stt, /health)"]
        ScoringEngine["Motor de Priorización & Reglas"]
        SummaryBuilder["Generador de Resúmenes & Guiones"]
    end

    subgraph External ["🌐 Servicios Externos & Modelos de IA"]
        GH["GitHub API v3 & GraphQL v4"]
        Gemma["Google Gemma 4 (Speech Synthesizer & NLP)"]
        Eleven["ElevenLabs (Scribe STT & Turbo v2.5 TTS)"]
    end

    UI -->|1. Solicita Standup (repo, lang, tono)| API
    API -->|2. Obtiene PRs abiertas y Checks| GH
    GH -->|3. Payload JSON de PRs| API
    API -->|4. Calcula puntuación y causas| ScoringEngine
    ScoringEngine -->|5. PRs ordenadas por severidad| SummaryBuilder
    SummaryBuilder -.->|6. Opcional: Guion conversacional| Gemma
    SummaryBuilder -->|7. Guion de locución| Eleven
    Eleven -->|8. Audio MP3 en streaming / base64| API
    API -->|9. Respuesta JSON + Audio| Frontend
    Frontend --> AudioPlayer
    Frontend --> PRDeck
```

---

## 🎯 Pipeline Técnico Detallado

El proyecto cuenta con dos pipelines de ingeniería documentados en [`.docs/`](file:///.docs):

### 1. [Pipeline de Audio a GitHub GraphQL API](file:///.docs/planning_audio_to_github_pipeline.md)
* **Entrada de voz:** Captura mediante micrófono (`POST /api/v1/voice/query-prs`).
* **Transcripción:** **ElevenLabs Scribe (STT)** transcribe la consulta en lenguaje natural en español/inglés.
* **Extracción de intención:** **Gemma 4** procesa la consulta hacia un esquema tipado Pydantic (`GitHubQueryIntent`), extrayendo repositorios, ventanas temporales, estados de CI y módulos afectados.
* **Consulta unificada GraphQL:** Extracción de metadatos, árbol de archivos (`files`), y rollup de integración continua (`statusCheckRollup`).

### 2. [Síntesis Narrativa con Gemma 4 y Locución con ElevenLabs](file:///.docs/planning_gemma_synthesis_and_elevenlabs.md)
* **Speech-Optimized Scripting:** Gemma 4 convierte datos crudos en un guion oral continuo (sin viñetas, sin markdown, fonetizando números de PR como *"el pull request cuarenta y dos"* y siglas como *"integración continua"*).
* **Regla "3 + Resto":** Análisis profundo de las 2-3 PRs más urgentes (CI roto, conflictos) y agrupación métrica cuantitativa del resto.
* **Streaming de Audio:** Generación mediante **ElevenLabs Turbo v2.5** con streaming HTTP chunked y transporte de metadatos mediante cabeceras codificadas (`X-User-Transcript`, `X-Speech-Script`).

---

## ⚖️ Algoritmo de Priorización Explicable

Cada Pull Request recibe una puntuación determinista calculada en [`backend/app/priority.py`](file:///backend/app/priority.py):

| Regla / Condición | Puntos | Motivo / Justificación |
|---|:---:|---|
| **Etiqueta urgente** (`security`, `critical`, `urgent`, `hotfix`, `p0`, `blocker`) | **+35** | Bloqueo crítico de producción o seguridad |
| **Aprobada, CI en verde y sin conflictos** | **+25** | Lista para fusionar inmediatamente |
| **Etiqueta importante** (`bug`, `p1`, `regression`) | **+20** | Corrección de fallos relevantes |
| **CI / Checks fallando** | **+20** | Requiere atención inmediata del autor |
| **Esperando revisión** | **+10 + 2/día** | Penaliza la cola de espera (máximo +28 pts) |
| **Conflictos con la rama base** | **+10** | Necesita rebase o resolución de merge |
| **Cambios solicitados (Changes requested)** | **+10** | Pendiente de nueva iteración del autor |
| **Inactividad ≥ 7 días (Stale)** | **+10** | Riesgo de quedar abandonada |
| **Cambio pequeño (≤ 50 líneas)** | **+5** | *Quick win*, revisión rápida |
| **Cambio muy grande (> 800 líneas)** | **-5** | Requiere descomposición o revisión extendida |
| **Borrador (Draft PR)** | **-40** | En trabajo activo, no lista para mezclar |

### Niveles y Estados
* **Nivel:** Alta ($\ge 45$), Media ($\ge 20$), Baja ($< 20$).
* **Estado:** `listo_para_merge`, `necesita_revision`, `cambios_solicitados`, `ci_fallando`, `conflictos`, `borrador`, `en_curso`.

---

## 📂 Estructura del Repositorio

```text
├── backend/
│   ├── app/
│   │   ├── config.py       # Configuración con pydantic-settings
│   │   ├── github.py       # Cliente HTTP asíncrono para GitHub API v3/v4
│   │   ├── main.py         # Endpoints FastAPI: /standup, /tts, /stt, /health
│   │   ├── priority.py     # Algoritmo de scoring explicable y generador de resumen
│   │   ├── schemas.py      # Modelos Pydantic v2 de entrada y salida
│   │   └── voice.py        # Integración con ElevenLabs (TTS streaming & STT Scribe)
│   ├── tests/              # Suite de pruebas con pytest (mocks sin red)
│   ├── pyproject.toml      # Dependencias y configuración de Python
│   └── README.md           # Guía técnica específica del backend
│
├── frontend/
│   ├── src/
│   │   ├── api/            # Cliente de API tipado y normalizador de errores
│   │   ├── app/            # Componente raíz App y layout del estudio
│   │   ├── components/     # Componentes compartidos (Header, LanguageSwitcher, ComingSoon)
│   │   ├── features/
│   │   │   ├── standup-form/    # Formulario: selector de repo, tono, formato y longitud
│   │   │   └── standup-result/  # Visualización: Audio player, lista de PRs, guion y estados
│   │   ├── i18n/           # Soporte bilingüe completo (Español / Inglés)
│   │   └── types.ts        # Tipos TypeScript compartidos
│   ├── package.json        # Dependencias (React 19, Vite, TanStack Query, Vitest)
│   └── vite.config.ts      # Configuración de Vite con aliases de rutas
│
└── .docs/
    ├── planning_audio_to_github_pipeline.md      # Especificación fase 1: STT & GitHub Intent
    └── planning_gemma_synthesis_and_elevenlabs.md # Especificación fase 2: Gemma 4 & TTS Streaming
```

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
- Python 3.11+
- Node.js 20+ y `pnpm` (o `npm`)
- Token de GitHub (opcional para repos públicos, pero recomendado para evitar rate limits: [Crear Personal Access Token](https://github.com/settings/tokens))
- Clave API de ElevenLabs ([Crear API Key en ElevenLabs](https://elevenlabs.io/))

---

### 1. Configurar y Arrancar el Backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate

# Instalar dependencias
pip install -e .

# Configurar variables de entorno
cp .env.example .env
```

Edita `backend/.env`:
```env
ELEVENLABS_API_KEY=tu_clave_elevenlabs
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
ELEVENLABS_MODEL_ID=eleven_turbo_v2_5
GITHUB_TOKEN=tu_github_pat_opcional
```

Arranca el servidor en modo desarrollo:
```bash
uvicorn app.main:app --reload --port 8000
```
* **Swagger / OpenAPI interactivo:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Configurar y Arrancar el Frontend

```bash
cd frontend

# Instalar dependencias
pnpm install  # o npm install

# Configurar variables de entorno (opcional si corre en localhost:8000)
cp .env.example .env
```

Arranca el servidor de desarrollo de Vite:
```bash
pnpm dev
```
Abre en tu navegador: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Ejecución de Tests

Ambos módulos cuentan con suites de pruebas unitarias e integración con mocks que no consumen cuota de red ni de APIs de IA:

### Backend (Pytest)
```bash
cd backend
pytest -v
```

### Frontend (Vitest)
```bash
cd frontend
pnpm test
```

---

## 🔌 Referencia de Endpoints API

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/standup` | Analiza el repositorio de GitHub, calcula prioridades y devuelve el JSON estructurado junto al audio en base64 de ElevenLabs. |
| `POST` | `/tts` | Convierte texto plano a audio MP3 utilizando la voz y modelo de ElevenLabs configurados. |
| `POST` | `/stt` | Transcribe archivos de audio mediante ElevenLabs Scribe. |
| `GET` | `/health` | Comprueba el estado del backend y la disponibilidad de credenciales (GitHub / ElevenLabs). |

### Ejemplo de Petición a `/standup`

```bash
curl -X POST "http://localhost:8000/standup" \
     -H "Content-Type: application/json" \
     -d '{
       "repo": "macagua/hacktoberfest-hack-day-madrid-2026",
       "lang": "es",
       "max_prs": 15,
       "spoken_top": 3,
       "include_audio": true
     }'
```

---

## 👥 Equipo "CTRL ALT ELITE"

Proyecto desarrollado en el marco del **Hacktoberfest Hack Day Madrid 2026**:
* Innovación en experiencia de desarrollador (DevEx) mediante interacción de voz.
* Integración de IA generativa con modelos abiertos (**Gemma 4**) y síntesis de voz líder en el sector (**ElevenLabs**).
* Código abierto, accesible y divertido.
