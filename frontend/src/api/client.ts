import { backendGitHub, backendStandup } from './backend'
import { createDirectGitHub } from './github'
import {
  createMockGitHub,
  createMockStandup,
  readMockOptionsFromUrl,
  type MockOptions,
} from './mock'
import type { ApiClient } from './types'

export type { ApiClient, GitHubSource, StandupSource } from './types'
export { HttpError } from './types'

interface ClientEnv {
  VITE_USE_MOCK?: string
  VITE_GITHUB_TOKEN?: string
}

/**
 * Elige de dónde sale cada cosa:
 *
 * | Datos de GitHub (usuario, repos, colaboradores) | Generación del standup |
 * | --- | --- |
 * | `VITE_GITHUB_TOKEN` definido → API de GitHub directa | `VITE_USE_MOCK=false` → backend |
 * | si no, mock activo → mock                            | si no → mock                   |
 * | si no → backend                                      |                                |
 *
 * Así se puede probar con repos reales y audio simulado mientras el backend no existe.
 */
export function createApiClient(env: ClientEnv, mockOptions: MockOptions = {}): ApiClient {
  const useMock = env.VITE_USE_MOCK !== 'false'
  const token = env.VITE_GITHUB_TOKEN?.trim()

  const github = token
    ? createDirectGitHub(token)
    : useMock
      ? createMockGitHub(mockOptions)
      : backendGitHub
  const standup = useMock ? createMockStandup(mockOptions) : backendStandup

  return { ...github, ...standup }
}

export const apiClient: ApiClient = createApiClient(import.meta.env, readMockOptionsFromUrl())
