import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { StandupSource } from '@/api/client'
import { createWrapper } from '@/test/utils'
import type { StandupRequest, StandupResponse } from '@/types'
import { useStandup } from './useStandup'

const request: StandupRequest = {
  repo: 'tu-usuario/standup-fm',
  source: 'ambos',
  author: null,
  from: '2026-10-03',
  to: '2026-10-10',
  max: 30,
  tone: 'gracioso',
  format: 'podcast',
  duration: 60,
  language: 'es',
}

const response: StandupResponse = {
  audioUrl: 'blob:audio',
  durationSec: 60,
  lines: [{ speaker: 'a', name: 'Tincho', text: 'Hola', startSec: 0 }],
}

function setup(generateStandup: StandupSource['generateStandup']) {
  return renderHook(() => useStandup(generateStandup), { wrapper: createWrapper() })
}

describe('useStandup', () => {
  it('arranca vacío', () => {
    const { result } = setup(vi.fn())
    expect(result.current.result).toEqual({ status: 'vacio' })
  })

  it('pasa por cargando y termina en listo con el pedido usado', async () => {
    let finish: (value: StandupResponse) => void = () => {}
    const generate = vi.fn<StandupSource['generateStandup']>(
      () => new Promise((resolve) => (finish = resolve)),
    )
    const { result } = setup(generate)

    act(() => result.current.generate(request))
    await waitFor(() => expect(result.current.result).toEqual({ status: 'cargando' }))
    await act(async () => finish(response))
    await waitFor(() =>
      expect(result.current.result).toEqual({ status: 'listo', data: response, request }),
    )
    expect(generate).toHaveBeenCalledWith(request, expect.any(AbortSignal))
  })

  it('una respuesta vacía (204) es sin-resultados', async () => {
    const { result } = setup(vi.fn().mockResolvedValue(null))
    act(() => result.current.generate(request))
    await waitFor(() => expect(result.current.result).toEqual({ status: 'sin-resultados' }))
  })

  it('un fallo es error, y reintentar vuelve a cargar', async () => {
    const generate = vi
      .fn<StandupSource['generateStandup']>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(response)
    const { result } = setup(generate)

    act(() => result.current.generate(request))
    await waitFor(() => expect(result.current.result).toEqual({ status: 'error' }))

    act(() => result.current.generate(request))
    await waitFor(() => expect(result.current.result.status).toBe('listo'))
    expect(generate).toHaveBeenCalledTimes(2)
  })

  it('si se genera dos veces, cancela la primera y gana la última', async () => {
    const signals: AbortSignal[] = []
    let resolveFirst: (value: StandupResponse) => void = () => {}
    const generate = vi.fn<StandupSource['generateStandup']>((_req, signal) => {
      if (signal) signals.push(signal)
      if (signals.length === 1) {
        return new Promise((resolve) => {
          resolveFirst = resolve
        })
      }
      return Promise.resolve(null)
    })
    const { result } = setup(generate)

    act(() => result.current.generate(request))
    await waitFor(() => expect(generate).toHaveBeenCalledTimes(1))
    act(() => result.current.generate({ ...request, tone: 'roast' }))
    await waitFor(() => expect(result.current.result).toEqual({ status: 'sin-resultados' }))

    expect(signals[0]?.aborted).toBe(true)
    // La primera responde tarde: no debe pisar el resultado de la segunda.
    await act(async () => resolveFirst(response))
    expect(result.current.result).toEqual({ status: 'sin-resultados' })
  })
})
