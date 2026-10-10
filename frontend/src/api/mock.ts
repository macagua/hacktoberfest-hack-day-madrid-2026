import type {
  Contributor,
  GitHubUser,
  Language,
  Repo,
  ScriptLine,
  StandupRequest,
  StandupResponse,
} from '@/types'
import type { ApiClient, GitHubSource, StandupSource } from './types'

export type MockOutcome = 'listo' | 'error' | 'sin-resultados'

export interface MockOptions {
  /** Cuánto tarda la "generación". En el diseño son 5,2 s. */
  delayMs?: number
  outcome?: MockOutcome
  /** Si arranca con la sesión de GitHub iniciada. */
  connected?: boolean
}

const MOCK_USER: GitHubUser = { login: 'tu-usuario', avatarUrl: '' }

const MOCK_REPOS: Repo[] = [
  { fullName: 'tu-usuario/standup-fm' },
  { fullName: 'tu-usuario/api-pagos' },
  { fullName: 'tu-usuario/landing' },
  { fullName: 'tu-equipo/app-mobile' },
  { fullName: 'tu-equipo/design-system' },
]

const MOCK_CONTRIBUTORS: Contributor[] = [
  { login: 'tu-usuario' },
  { login: 'compa-uno' },
  { login: 'compa-dos' },
]

type MockScript = ReadonlyArray<readonly [ScriptLine['speaker'], string]>

// El guion lo escribe el backend en el idioma pedido; el mock imita eso.
const MOCK_SCRIPTS: Record<Language, MockScript> = {
  es: [
    [
      'a',
      '¡Buenas noches, equipo! Esto es Standup FM, la única radio donde el hit de la semana es un merge.',
    ],
    [
      'b',
      'Y qué semana, Tincho. Veintitrés commits, cuatro PRs y un mensaje que solo dice «arreglo».',
    ],
    ['a', '«Arreglo». Sin contexto. Poesía pura.'],
    [
      'b',
      'El PR estrella fue el login nuevo: tres reviews, dos cafés y un «LGTM» a las dos de la mañana.',
    ],
    ['a', 'Mención especial al commit «ahora sí», que llegó justo después de «fix definitivo».'],
    ['b', 'Spoiler: no era definitivo.'],
    ['a', 'En resumen: se avanzó, se rompió poco y los tests pasan. Casi todos.'],
    ['b', 'Esto fue Standup FM. Hagan push con responsabilidad.'],
  ],
  en: [
    [
      'a',
      'Good evening, team! This is Standup FM, the only station where the hit of the week is a merge.',
    ],
    [
      'b',
      'And what a week, Tincho. Twenty-three commits, four PRs and one message that just says “fix”.',
    ],
    ['a', '“Fix”. No context. Pure poetry.'],
    [
      'b',
      'The star PR was the new login: three reviews, two coffees and an “LGTM” at two in the morning.',
    ],
    ['a', 'Honourable mention for the commit “now it works”, right after “final fix”.'],
    ['b', 'Spoiler: it was not final.'],
    ['a', 'In short: progress was made, little broke and the tests pass. Almost all of them.'],
    ['b', 'This was Standup FM. Push responsibly.'],
  ],
}

const SPEAKER_NAMES = { a: 'Tincho', b: 'Lau' } as const

/**
 * Lee `?mock=error`, `?mock=vacio` o `?mock=desconectado` de la URL
 * para poder forzar cada estado sin tocar código.
 */
export function readMockOptionsFromUrl(search: string = window.location.search): MockOptions {
  const mode = new URLSearchParams(search).get('mock')
  switch (mode) {
    case 'error':
      return { outcome: 'error' }
    case 'vacio':
    case 'sin-resultados':
      return { outcome: 'sin-resultados' }
    case 'desconectado':
      return { connected: false }
    default:
      return {}
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Cancelado', 'AbortError'))
      return
    }
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

/** WAV de silencio (8 kHz, 8 bits, mono) para que el `<audio>` tenga algo real que reproducir. */
function createSilentWavUrl(seconds: number): string {
  if (typeof URL.createObjectURL !== 'function') return ''
  const sampleRate = 8000
  const samples = Math.round(sampleRate * seconds)
  const buffer = new ArrayBuffer(44 + samples)
  const view = new DataView(buffer)
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i))
  }
  writeText(0, 'RIFF')
  view.setUint32(4, 36 + samples, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true) // tamaño del bloque fmt
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate, true) // bytes por segundo
  view.setUint16(32, 1, true) // bytes por muestra
  view.setUint16(34, 8, true) // bits por muestra
  writeText(36, 'data')
  view.setUint32(40, samples, true)
  new Uint8Array(buffer, 44).fill(128) // 128 = silencio en PCM de 8 bits
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

function buildMockResponse({ duration: durationSec, language }: StandupRequest): StandupResponse {
  const script = MOCK_SCRIPTS[language]
  const step = durationSec / script.length
  return {
    audioUrl: createSilentWavUrl(durationSec),
    durationSec,
    lines: script.map(([speaker, text], index) => ({
      speaker,
      name: SPEAKER_NAMES[speaker],
      text,
      startSec: Math.round(index * step * 10) / 10,
    })),
  }
}

export function createMockGitHub({ connected = true }: MockOptions = {}): GitHubSource {
  let isConnected = connected
  return {
    async getMe() {
      return isConnected ? MOCK_USER : null
    },
    async getRepos() {
      return MOCK_REPOS
    },
    async getContributors() {
      return MOCK_CONTRIBUTORS
    },
    async login() {
      isConnected = true
      return MOCK_USER
    },
    async logout() {
      isConnected = false
    },
  }
}

export function createMockStandup({
  delayMs = 5200,
  outcome = 'listo',
}: MockOptions = {}): StandupSource {
  return {
    async generateStandup(request, signal) {
      await wait(delayMs, signal)
      if (outcome === 'error') throw new Error('Error simulado')
      if (outcome === 'sin-resultados') return null
      return buildMockResponse(request)
    },
  }
}

export function createMockClient(options: MockOptions = {}): ApiClient {
  return { ...createMockGitHub(options), ...createMockStandup(options) }
}
