import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError, type ApiClient } from '@/api/client'
import { buildFakeResult } from '@/test/fakeClient'
import { createWrapper } from '@/test/utils'
import type { StandupRequest, StandupResult } from '@/types'
import { useStandup } from './useStandup'

type Generate = ApiClient['generateStandup']

const request: StandupRequest = { repo: 'acme/demo', language: 'es', maxPrs: 30 }
const result = buildFakeResult(request)

function setup(generateStandup: Generate) {
  return renderHook(() => useStandup(generateStandup), { wrapper: createWrapper() })
}

describe('useStandup', () => {
  it('arranca vacío', () => {
    const { result: hook } = setup(vi.fn<Generate>())
    expect(hook.current.result).toEqual({ status: 'vacio' })
  })

  it('pasa por cargando y termina en listo con el pedido usado', async () => {
    let finish: (value: StandupResult) => void = () => {}
    const generate = vi.fn<Generate>(() => new Promise((resolve) => (finish = resolve)))
    const { result: hook } = setup(generate)

    act(() => hook.current.generate(request))
    await waitFor(() => expect(hook.current.result).toEqual({ status: 'cargando' }))
    await act(async () => finish(result))
    await waitFor(() =>
      expect(hook.current.result).toEqual({ status: 'listo', data: result, request }),
    )
    expect(generate).toHaveBeenCalledWith(request, expect.any(AbortSignal))
  })

  it('un repo sin PRs abiertas es sin-resultados', async () => {
    const empty: StandupResult = { ...result, totalOpen: 0, prs: [] }
    const { result: hook } = setup(vi.fn<Generate>().mockResolvedValue(empty))
    act(() => hook.current.generate(request))
    await waitFor(() => expect(hook.current.result).toEqual({ status: 'sin-resultados' }))
  })

  it('clasifica el error que manda la API', async () => {
    const generate = vi
      .fn<Generate>()
      .mockRejectedValue(new ApiError('repo-no-encontrado', '404', 404))
    const { result: hook } = setup(generate)
    act(() => hook.current.generate(request))
    await waitFor(() =>
      expect(hook.current.result).toEqual({ status: 'error', kind: 'repo-no-encontrado' }),
    )
  })

  it('un error inesperado es desconocido, y reintentar vuelve a cargar', async () => {
    const generate = vi
      .fn<Generate>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(result)
    const { result: hook } = setup(generate)

    act(() => hook.current.generate(request))
    await waitFor(() =>
      expect(hook.current.result).toEqual({ status: 'error', kind: 'desconocido' }),
    )
    act(() => hook.current.generate(request))
    await waitFor(() => expect(hook.current.result.status).toBe('listo'))
  })

  it('si se genera dos veces, cancela la primera y gana la última', async () => {
    const signals: AbortSignal[] = []
    let resolveFirst: (value: StandupResult) => void = () => {}
    const empty: StandupResult = { ...result, totalOpen: 0, prs: [] }
    const generate = vi.fn<Generate>((_request, signal) => {
      if (signal) signals.push(signal)
      if (signals.length === 1) {
        return new Promise((resolve) => {
          resolveFirst = resolve
        })
      }
      return Promise.resolve(empty)
    })
    const { result: hook } = setup(generate)

    act(() => hook.current.generate(request))
    await waitFor(() => expect(generate).toHaveBeenCalledTimes(1))
    act(() => hook.current.generate({ ...request, language: 'en' }))
    await waitFor(() => expect(hook.current.result).toEqual({ status: 'sin-resultados' }))

    expect(signals[0]?.aborted).toBe(true)
    // La primera responde tarde: no debe pisar el resultado de la segunda.
    await act(async () => resolveFirst(result))
    expect(hook.current.result).toEqual({ status: 'sin-resultados' })
  })
})
