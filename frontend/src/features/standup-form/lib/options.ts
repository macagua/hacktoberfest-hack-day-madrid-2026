import type { TFunction } from 'i18next'
import { normalizeRepo } from './repo'
import type {
  Duration,
  Format,
  Language,
  Source,
  StandupOptions,
  StandupRequest,
  Tone,
} from '@/types'

// Valores posibles de cada opción, en el orden en que se muestran.
// Los textos viven en las traducciones (`options.<campo>.<valor>`).
export const SOURCES: readonly Source[] = ['commits', 'prs', 'ambos']
export const TONES: readonly Tone[] = ['serio', 'gracioso', 'roast']
export const FORMATS: readonly Format[] = ['podcast', 'noticiero', 'futbol', 'documental']
export const DURATIONS: readonly Duration[] = [30, 60, 120]
export const LANGUAGES: readonly Language[] = ['es', 'en']

export const MAX_MIN = 1
export const MAX_CAP = 100
export const DEFAULT_MAX = 30
export const DEFAULT_RANGE_DAYS = 7

/** Repo precargado: así el primer clic en «Generar standup» ya funciona. */
export const DEFAULT_REPO =
  import.meta.env.VITE_DEFAULT_REPO || 'macagua/hacktoberfest-hack-day-madrid-2026'

/**
 * Convierte lo que se escribió en el campo "Máximo" en un número dentro de 1–100.
 * Devuelve null si el campo queda vacío o no es un número, para poder borrarlo y reescribirlo.
 */
export function clampMax(raw: string): number | null {
  const value = Number.parseInt(raw.trim(), 10)
  if (Number.isNaN(value)) return null
  return Math.min(MAX_CAP, Math.max(MAX_MIN, value))
}

/** Fecha local en formato `YYYY-MM-DD`, que es lo que espera `<input type="date">`. */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function daysAgo(days: number, now: Date = new Date()): string {
  const date = new Date(now)
  date.setDate(date.getDate() - days)
  return toISODate(date)
}

interface DefaultOptionsInput {
  now?: Date
  repo?: string
  /** Idioma del podcast; por defecto, el de la interfaz. */
  language?: Language
}

export function createDefaultOptions({
  now = new Date(),
  repo = DEFAULT_REPO,
  language = 'es',
}: DefaultOptionsInput = {}): StandupOptions {
  return {
    repo,
    source: 'ambos',
    author: null,
    from: daysAgo(DEFAULT_RANGE_DAYS, now),
    to: toISODate(now),
    max: DEFAULT_MAX,
    tone: 'gracioso',
    format: 'podcast',
    duration: 60,
    language,
  }
}

/**
 * Arma el pedido con lo que hoy soporta el backend (repo, idioma y máximo de PRs).
 * Devuelve null si el repo no tiene un formato válido.
 */
export function toRequest(options: StandupOptions): StandupRequest | null {
  const repo = normalizeRepo(options.repo)
  if (!repo) return null
  return {
    repo,
    language: options.language,
    maxPrs: options.max ?? DEFAULT_MAX,
  }
}

/** Línea de resumen bajo el título del reproductor: "Español · hasta 30 PRs". */
export function describeRequest(request: StandupRequest, t: TFunction): string {
  return [
    t(`options.language.${request.language}`),
    t('result.player.maxPrs', { count: request.maxPrs }),
  ].join(' · ')
}

export function pickRandom<T>(values: readonly T[], random: () => number = Math.random): T {
  const index = Math.min(values.length - 1, Math.floor(random() * values.length))
  const value = values[index]
  if (value === undefined) throw new Error('pickRandom necesita al menos un valor')
  return value
}
