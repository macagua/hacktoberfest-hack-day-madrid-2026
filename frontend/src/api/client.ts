import type { StandupRequest, StandupResult } from '@/types'
import { parseStandupResponse } from './parse'
import { ApiError, errorKindFromStatus, type ApiClient } from './types'

export { ApiError, type ApiClient } from './types'

/**
 * Base de la API. En desarrollo es `/api`, que Vite reenvía al backend (ver vite.config.ts).
 * En producción se define `VITE_API_URL` con la URL pública del backend.
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

/** Cuerpo de POST /standup tal como lo espera el backend (backend/app/schemas.py). */
interface StandupRequestBody {
  repo: string
  lang: StandupRequest['language']
  max_prs: number
  include_audio: boolean
}

function toBody(request: StandupRequest): StandupRequestBody {
  return {
    repo: request.repo,
    lang: request.language,
    max_prs: request.maxPrs,
    include_audio: true,
  }
}

export function createApiClient(baseUrl: string = API_BASE_URL): ApiClient {
  return {
    async generateStandup(request, signal): Promise<StandupResult> {
      let response: Response
      try {
        response = await fetch(`${baseUrl}/standup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(toBody(request)),
          signal,
        })
      } catch (error) {
        if (signal?.aborted) throw error
        throw new ApiError('sin-conexion', 'No se pudo conectar con el backend')
      }

      if (!response.ok) {
        throw new ApiError(
          errorKindFromStatus(response.status),
          `POST /standup respondió ${response.status}`,
          response.status,
        )
      }
      return parseStandupResponse(await response.json())
    },
  }
}

export const apiClient: ApiClient = createApiClient()
