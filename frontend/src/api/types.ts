import type { StandupErrorKind, StandupRequest, StandupResult } from '@/types'

export interface ApiClient {
  generateStandup(request: StandupRequest, signal?: AbortSignal): Promise<StandupResult>
}

/** Error de la API ya clasificado para mostrar el mensaje adecuado. */
export class ApiError extends Error {
  readonly kind: StandupErrorKind
  readonly status: number | null

  constructor(kind: StandupErrorKind, message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

/** Traduce el código HTTP del backend al tipo de error que entiende la interfaz. */
export function errorKindFromStatus(status: number): StandupErrorKind {
  switch (status) {
    case 404:
      return 'repo-no-encontrado'
    case 422:
      return 'repo-invalido'
    case 429:
      return 'limite-github'
    case 502:
      return 'fallo-github'
    default:
      return 'desconocido'
  }
}
