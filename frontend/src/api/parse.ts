import type {
  CiState,
  PrioritizedPullRequest,
  PriorityLevel,
  PrStatus,
  PullRequest,
  ReviewState,
  StandupResult,
} from '@/types'

// Validación y paso a camelCase de la respuesta de POST /standup (backend/app/schemas.py).
// Si la forma no es la esperada lanzamos un error: mejor el estado de error que una pantalla rota.

type JsonObject = Record<string, unknown>

function readObject(value: unknown, path: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`${path}: se esperaba un objeto`)
  }
  return value as JsonObject
}

function readArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new TypeError(`${path}: se esperaba una lista`)
  return value
}

function readString(obj: JsonObject, key: string, path: string): string {
  const value = obj[key]
  if (typeof value !== 'string') throw new TypeError(`${path}.${key}: se esperaba texto`)
  return value
}

function readNullableString(obj: JsonObject, key: string, path: string): string | null {
  return obj[key] === null || obj[key] === undefined ? null : readString(obj, key, path)
}

function readNumber(obj: JsonObject, key: string, path: string): number {
  const value = obj[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${path}.${key}: se esperaba un número`)
  }
  return value
}

function readNullableNumber(obj: JsonObject, key: string, path: string): number | null {
  return obj[key] === null || obj[key] === undefined ? null : readNumber(obj, key, path)
}

function readEnum<T extends string>(
  obj: JsonObject,
  key: string,
  allowed: readonly T[],
  path: string,
): T {
  const value = readString(obj, key, path)
  const match = allowed.find((option) => option === value)
  if (match === undefined) throw new TypeError(`${path}.${key}: valor inesperado "${value}"`)
  return match
}

const LEVELS: readonly PriorityLevel[] = ['alta', 'media', 'baja']
const STATUSES: readonly PrStatus[] = [
  'listo_para_merge',
  'necesita_revision',
  'cambios_solicitados',
  'ci_fallando',
  'conflictos',
  'borrador',
  'en_curso',
]
const REVIEW_STATES: readonly ReviewState[] = ['approved', 'changes_requested', 'commented', 'none']
const CI_STATES: readonly CiState[] = ['success', 'failure', 'pending', 'none']

function parsePullRequest(value: unknown, path: string): PullRequest {
  const obj = readObject(value, path)
  return {
    number: readNumber(obj, 'number', path),
    title: readString(obj, 'title', path),
    url: readString(obj, 'url', path),
    author: readString(obj, 'author', path),
    draft: obj.draft === true,
    labels: readArray(obj.labels ?? [], `${path}.labels`).filter(
      (label): label is string => typeof label === 'string',
    ),
    ageDays: readNumber(obj, 'age_days', path),
    idleDays: readNumber(obj, 'idle_days', path),
    additions: readNullableNumber(obj, 'additions', path),
    deletions: readNullableNumber(obj, 'deletions', path),
    reviewState: readEnum(obj, 'review_state', REVIEW_STATES, path),
    ciState: readEnum(obj, 'ci_state', CI_STATES, path),
  }
}

function parsePrioritized(value: unknown, path: string): PrioritizedPullRequest {
  const obj = readObject(value, path)
  return {
    pr: parsePullRequest(obj.pr, `${path}.pr`),
    score: readNumber(obj, 'score', path),
    level: readEnum(obj, 'level', LEVELS, path),
    status: readEnum(obj, 'status', STATUSES, path),
    nextAction: readString(obj, 'next_action', path),
    reasons: readArray(obj.reasons, `${path}.reasons`).map((item, index) => {
      const reasonPath = `${path}.reasons[${index}]`
      const reason = readObject(item, reasonPath)
      return {
        reason: readString(reason, 'reason', reasonPath),
        points: readNumber(reason, 'points', reasonPath),
      }
    }),
  }
}

export function parseStandupResponse(value: unknown): StandupResult {
  const obj = readObject(value, 'respuesta')
  const audioBase64 = readNullableString(obj, 'audio_base64', 'respuesta')
  const audioMime = readNullableString(obj, 'audio_mime', 'respuesta') ?? 'audio/mpeg'

  return {
    repo: readString(obj, 'repo', 'respuesta'),
    generatedAt: readString(obj, 'generated_at', 'respuesta'),
    totalOpen: readNumber(obj, 'total_open', 'respuesta'),
    summary: readString(obj, 'summary', 'respuesta'),
    prs: readArray(obj.prs, 'respuesta.prs').map((item, index) =>
      parsePrioritized(item, `respuesta.prs[${index}]`),
    ),
    audio: audioBase64 ? { src: `data:${audioMime};base64,${audioBase64}`, mime: audioMime } : null,
    audioError: readNullableString(obj, 'audio_error', 'respuesta'),
  }
}
