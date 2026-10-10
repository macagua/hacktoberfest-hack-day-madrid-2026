import type { ApiClient } from '@/api/client'
import { ApiError } from '@/api/client'
import type { StandupErrorKind, StandupRequest, StandupResult } from '@/types'

// Cliente falso para los tests: imita al backend sin red.

export type FakeOutcome = 'listo' | 'sin-resultados' | StandupErrorKind

export interface FakeClientOptions {
  delayMs?: number
  outcome?: FakeOutcome
  /** Si es false, la respuesta llega sin audio (como cuando falta la clave de ElevenLabs). */
  withAudio?: boolean
}

const SUMMARIES = {
  es: 'Buenas. Hay 2 pull requests abiertas. Primero, la número 12, Arreglar login. Después, la número 7, Nuevo tema oscuro. Eso es todo.',
  en: 'Hi. There are 2 open pull requests. First, number 12, Fix login. Then, number 7, New dark theme. That is all.',
} as const

export function buildFakeResult(request: StandupRequest, withAudio = true): StandupResult {
  return {
    repo: request.repo,
    generatedAt: '2026-10-10T17:00:00+00:00',
    totalOpen: 2,
    summary: SUMMARIES[request.language],
    prs: [
      {
        pr: {
          number: 12,
          title: 'Arreglar login',
          url: 'https://github.com/acme/demo/pull/12',
          author: 'ana',
          draft: false,
          labels: ['bug'],
          ageDays: 9,
          idleDays: 8,
          additions: 20,
          deletions: 5,
          reviewState: 'none',
          ciState: 'failure',
        },
        score: 73,
        level: 'alta',
        status: 'ci_fallando',
        nextAction: 'Arreglar los checks que fallan',
        reasons: [
          { reason: 'Esperando revisión desde hace 9 días', points: 28 },
          { reason: 'Los checks de CI están fallando', points: 20 },
        ],
      },
      {
        pr: {
          number: 7,
          title: 'Nuevo tema oscuro',
          url: 'https://github.com/acme/demo/pull/7',
          author: 'bob',
          draft: true,
          labels: [],
          ageDays: 2,
          idleDays: 1,
          additions: null,
          deletions: null,
          reviewState: 'none',
          ciState: 'none',
        },
        score: 4,
        level: 'baja',
        status: 'borrador',
        nextAction: 'Terminarla y marcarla como lista',
        reasons: [{ reason: 'Es un borrador', points: -40 }],
      },
    ],
    audio: withAudio ? { src: 'data:audio/mpeg;base64,', mime: 'audio/mpeg' } : null,
    audioError: withAudio ? null : 'Falta ELEVENLABS_API_KEY',
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Cancelado', 'AbortError'))
      },
      { once: true },
    )
  })
}

export function createFakeClient({
  delayMs = 10,
  outcome = 'listo',
  withAudio = true,
}: FakeClientOptions = {}): ApiClient {
  return {
    async generateStandup(request, signal) {
      await wait(delayMs, signal)
      if (outcome === 'listo') return buildFakeResult(request, withAudio)
      if (outcome === 'sin-resultados') {
        return { ...buildFakeResult(request, withAudio), totalOpen: 0, prs: [] }
      }
      throw new ApiError(outcome, `Error simulado: ${outcome}`)
    },
  }
}
