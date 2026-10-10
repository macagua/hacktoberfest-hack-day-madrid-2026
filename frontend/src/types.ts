// ---------------------------------------------------------------------------
// Formulario
// ---------------------------------------------------------------------------

export type Tone = 'serio' | 'gracioso' | 'roast'
export type Format = 'podcast' | 'noticiero' | 'futbol' | 'documental'
export type Source = 'commits' | 'prs' | 'ambos'
export type Duration = 30 | 60 | 120
export type Language = 'es' | 'en'

/**
 * Estado del formulario tal como lo edita la persona.
 * `author` en null = todo el equipo; `max` en null = el campo quedó vacío mientras se escribe.
 *
 * `source`, `author`, `from`, `to`, `tone`, `format` y `duration` todavía no los soporta
 * el backend: se muestran desactivados y no se envían.
 */
export interface StandupOptions {
  repo: string
  source: Source
  author: string | null
  from: string
  to: string
  max: number | null
  tone: Tone
  format: Format
  duration: Duration
  language: Language
}

/** Lo que el front pide al backend, ya validado. */
export interface StandupRequest {
  /** `owner/nombre`. */
  repo: string
  language: Language
  /** Máximo de PRs abiertas a analizar (1–100). */
  maxPrs: number
}

// ---------------------------------------------------------------------------
// Respuesta del backend (POST /standup), en camelCase
// ---------------------------------------------------------------------------

export type PriorityLevel = 'alta' | 'media' | 'baja'

export type PrStatus =
  | 'listo_para_merge'
  | 'necesita_revision'
  | 'cambios_solicitados'
  | 'ci_fallando'
  | 'conflictos'
  | 'borrador'
  | 'en_curso'

export type ReviewState = 'approved' | 'changes_requested' | 'commented' | 'none'
export type CiState = 'success' | 'failure' | 'pending' | 'none'

export interface PullRequest {
  number: number
  title: string
  url: string
  author: string
  draft: boolean
  labels: string[]
  ageDays: number
  idleDays: number
  additions: number | null
  deletions: number | null
  reviewState: ReviewState
  ciState: CiState
}

export interface PriorityReason {
  reason: string
  points: number
}

export interface PrioritizedPullRequest {
  pr: PullRequest
  score: number
  level: PriorityLevel
  status: PrStatus
  /** Ya viene redactada por el backend en el idioma pedido. */
  nextAction: string
  reasons: PriorityReason[]
}

export interface StandupAudio {
  /** URL lista para `<audio src>` (data URL con el MP3). */
  src: string
  mime: string
}

export interface StandupResult {
  repo: string
  generatedAt: string
  totalOpen: number
  /** Texto que se narra en el audio. */
  summary: string
  /** Ordenadas de mayor a menor prioridad. */
  prs: PrioritizedPullRequest[]
  /** null si el backend no pudo generar la voz (ver `audioError`). */
  audio: StandupAudio | null
  audioError: string | null
}

/** Una frase del guion con su momento estimado dentro del audio. */
export interface ScriptLine {
  text: string
  startSec: number
}

// ---------------------------------------------------------------------------
// Estado de la generación
// ---------------------------------------------------------------------------

export type StandupErrorKind =
  | 'repo-no-encontrado'
  | 'repo-invalido'
  | 'limite-github'
  | 'fallo-github'
  | 'sin-conexion'
  | 'desconocido'

export type ResultState =
  | { status: 'vacio' }
  | { status: 'cargando' }
  | { status: 'listo'; data: StandupResult; request: StandupRequest }
  | { status: 'error'; kind: StandupErrorKind }
  | { status: 'sin-resultados' }
