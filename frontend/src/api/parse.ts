import type { Contributor, GitHubUser, Repo, ScriptLine, StandupResponse } from '@/types'

// Validación mínima de lo que llega por red: si la forma no es la esperada,
// preferimos mostrar el estado de error antes que romper la pantalla.

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(obj: JsonObject, key: string): string {
  const value = obj[key]
  if (typeof value !== 'string') throw new TypeError(`Se esperaba "${key}" como texto`)
  return value
}

function readNumber(obj: JsonObject, key: string): number {
  const value = obj[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Se esperaba "${key}" como número`)
  }
  return value
}

function readArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new TypeError('Se esperaba una lista')
  return value
}

function readObject(value: unknown): JsonObject {
  if (!isObject(value)) throw new TypeError('Se esperaba un objeto')
  return value
}

function parseLine(value: unknown): ScriptLine {
  const obj = readObject(value)
  const speaker = obj.speaker
  if (speaker !== 'a' && speaker !== 'b') throw new TypeError('"speaker" debe ser "a" o "b"')
  return {
    speaker,
    name: readString(obj, 'name'),
    text: readString(obj, 'text'),
    startSec: readNumber(obj, 'startSec'),
  }
}

export function parseStandupResponse(value: unknown): StandupResponse {
  const obj = readObject(value)
  return {
    audioUrl: readString(obj, 'audioUrl'),
    durationSec: readNumber(obj, 'durationSec'),
    lines: readArray(obj.lines).map(parseLine),
  }
}

/** Forma del backend: `{ login, avatarUrl }`. */
export function parseUser(value: unknown): GitHubUser {
  const obj = readObject(value)
  return { login: readString(obj, 'login'), avatarUrl: readString(obj, 'avatarUrl') }
}

/** Forma del backend: `[{ fullName }]`. */
export function parseRepos(value: unknown): Repo[] {
  return readArray(value).map((item) => ({ fullName: readString(readObject(item), 'fullName') }))
}

/** Forma del backend: `[{ login }]`. */
export function parseContributors(value: unknown): Contributor[] {
  return readArray(value).map((item) => ({ login: readString(readObject(item), 'login') }))
}

/** Forma de la API REST de GitHub: `{ login, avatar_url }`. */
export function parseGitHubUser(value: unknown): GitHubUser {
  const obj = readObject(value)
  return { login: readString(obj, 'login'), avatarUrl: readString(obj, 'avatar_url') }
}

/** Forma de la API REST de GitHub: `[{ full_name }]`. */
export function parseGitHubRepos(value: unknown): Repo[] {
  return readArray(value).map((item) => ({ fullName: readString(readObject(item), 'full_name') }))
}

/** Forma de la API REST de GitHub: `[{ login, type }]`. Deja afuera los bots. */
export function parseGitHubContributors(value: unknown): Contributor[] {
  return readArray(value)
    .map(readObject)
    .filter((item) => item.type !== 'Bot')
    .map((item) => ({ login: readString(item, 'login') }))
}
