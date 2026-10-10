export type Tone = 'serio' | 'gracioso' | 'roast'
export type Format = 'podcast' | 'noticiero' | 'futbol' | 'documental'
export type Source = 'commits' | 'prs' | 'ambos'
export type Duration = 30 | 60 | 120
export type Language = 'es' | 'en'
export type Speaker = 'a' | 'b'

/**
 * Estado del formulario tal como lo edita la persona.
 * `repo` en null = todavía sin elegir; `author` en null = todo el equipo;
 * `max` en null = el campo quedó vacío mientras se escribe.
 */
export interface StandupOptions {
  repo: string | null
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

/** Cuerpo de `POST /api/standup`. */
export interface StandupRequest {
  repo: string
  source: Source
  /** null = todo el equipo. */
  author: string | null
  /** Fecha ISO `YYYY-MM-DD`. */
  from: string
  /** Fecha ISO `YYYY-MM-DD`. */
  to: string
  max: number
  tone: Tone
  format: Format
  duration: Duration
  language: Language
}

export interface ScriptLine {
  speaker: Speaker
  name: string
  text: string
  startSec: number
}

export interface StandupResponse {
  audioUrl: string
  durationSec: number
  lines: ScriptLine[]
}

export type ResultState =
  | { status: 'vacio' }
  | { status: 'cargando' }
  | { status: 'listo'; data: StandupResponse; request: StandupRequest }
  | { status: 'error' }
  | { status: 'sin-resultados' }

export interface GitHubUser {
  login: string
  avatarUrl: string
}

export interface Repo {
  fullName: string
}

export interface Contributor {
  login: string
}

export type Session =
  { status: 'cargando' } | { status: 'desconectado' } | { status: 'conectado'; user: GitHubUser }
