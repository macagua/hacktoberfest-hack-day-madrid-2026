import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createApiClient } from './client'

// Respuesta con la forma exacta de backend/app/schemas.py (StandupResponse).
const backendResponse = {
  repo: 'acme/demo',
  generated_at: '2026-10-10T15:30:00+00:00',
  total_open: 1,
  counts: { alta: 1, media: 0, baja: 0, ci_fallando: 1 },
  summary: 'Buenas. Hay 1 pull request abierta.',
  prs: [
    {
      pr: {
        number: 1,
        title: 'Fix login crash',
        url: 'https://github.com/acme/demo/pull/1',
        author: 'ana',
        draft: false,
        labels: ['bug'],
        created_at: '2026-10-01T10:00:00Z',
        updated_at: '2026-10-02T10:00:00Z',
        age_days: 9,
        idle_days: 8,
        additions: 20,
        deletions: 5,
        changed_files: 2,
        review_state: 'none',
        ci_state: 'failure',
        mergeable_state: 'unstable',
        requested_reviewers: ['bob'],
      },
      score: 73,
      level: 'alta',
      status: 'ci_fallando',
      next_action: 'Arreglar los checks que fallan',
      reasons: [{ reason: 'Los checks de CI están fallando', points: 20 }],
    },
  ],
  audio_base64: 'SUQz',
  audio_mime: 'audio/mpeg',
  audio_error: null,
}

function mockFetch(response: Response | Error) {
  const fetchMock = vi.fn<typeof fetch>(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const request = { repo: 'acme/demo', language: 'es', maxPrs: 30 } as const

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createApiClient', () => {
  it('manda el cuerpo que espera el backend', async () => {
    const fetchMock = mockFetch(Response.json(backendResponse))
    await createApiClient('/api').generateStandup(request)

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('/api/standup')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({
      repo: 'acme/demo',
      lang: 'es',
      max_prs: 30,
      include_audio: true,
    })
  })

  it('pasa la respuesta a camelCase y arma la URL del audio', async () => {
    mockFetch(Response.json(backendResponse))
    const result = await createApiClient('/api').generateStandup(request)

    expect(result.totalOpen).toBe(1)
    expect(result.audio).toEqual({ src: 'data:audio/mpeg;base64,SUQz', mime: 'audio/mpeg' })
    expect(result.prs[0]).toMatchObject({
      score: 73,
      level: 'alta',
      status: 'ci_fallando',
      nextAction: 'Arreglar los checks que fallan',
      pr: { number: 1, author: 'ana', ageDays: 9, idleDays: 8, ciState: 'failure' },
    })
  })

  it('sin audio deja el motivo que manda el backend', async () => {
    mockFetch(
      Response.json({
        ...backendResponse,
        audio_base64: null,
        audio_error: 'Falta ELEVENLABS_API_KEY',
      }),
    )
    const result = await createApiClient('/api').generateStandup(request)
    expect(result.audio).toBeNull()
    expect(result.audioError).toBe('Falta ELEVENLABS_API_KEY')
  })

  it.each([
    [404, 'repo-no-encontrado'],
    [422, 'repo-invalido'],
    [429, 'limite-github'],
    [502, 'fallo-github'],
    [500, 'desconocido'],
  ] as const)('un %d se clasifica como %s', async (status, kind) => {
    mockFetch(new Response('{"detail":"x"}', { status }))
    await expect(createApiClient('/api').generateStandup(request)).rejects.toMatchObject({
      name: 'ApiError',
      kind,
      status,
    })
  })

  it('si el backend no responde, es sin-conexion', async () => {
    mockFetch(new TypeError('Failed to fetch'))
    const error = await createApiClient('/api')
      .generateStandup(request)
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'sin-conexion' })
  })

  it('rechaza una respuesta con forma inesperada', async () => {
    mockFetch(Response.json({ ...backendResponse, prs: [{ score: 'mucho' }] }))
    await expect(createApiClient('/api').generateStandup(request)).rejects.toBeInstanceOf(TypeError)
  })
})
