import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import type { StandupSource } from '@/api/client'
import type { ResultState, StandupRequest, StandupResponse } from '@/types'

export interface UseStandup {
  result: ResultState
  generate: (request: StandupRequest) => void
}

/**
 * Máquina de estados de la generación: vacio → cargando → listo | error | sin-resultados.
 * Es una mutación (POST). Si se vuelve a generar mientras carga, el pedido anterior se cancela;
 * `useMutation` además refleja solo la última llamada, así que una respuesta vieja nunca pisa a la nueva.
 */
export function useStandup(generateStandup: StandupSource['generateStandup']): UseStandup {
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  const mutation = useMutation({
    mutationFn: (request: StandupRequest) => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller
      return generateStandup(request, controller.signal)
    },
  })

  const { mutate } = mutation
  const generate = useCallback((request: StandupRequest) => mutate(request), [mutate])

  return { result: toResultState(mutation), generate }
}

type MutationSnapshot = Pick<
  UseMutationResult<StandupResponse | null, Error, StandupRequest>,
  'status' | 'data' | 'variables'
>

function toResultState({ status, data, variables }: MutationSnapshot): ResultState {
  switch (status) {
    case 'idle':
      return { status: 'vacio' }
    case 'pending':
      return { status: 'cargando' }
    case 'error':
      return { status: 'error' }
    case 'success':
      return data && variables
        ? { status: 'listo', data, request: variables }
        : { status: 'sin-resultados' }
  }
}
