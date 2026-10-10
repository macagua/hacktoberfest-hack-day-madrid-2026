import type { Contributor, GitHubUser, Repo, StandupRequest, StandupResponse } from '@/types'

/** Todo lo que el front necesita saber de GitHub: quién sos, tus repos y sus colaboradores. */
export interface GitHubSource {
  /** Usuario conectado, o null si no hay sesión (401). */
  getMe(): Promise<GitHubUser | null>
  getRepos(): Promise<Repo[]>
  /** `repo` en formato `owner/nombre`. */
  getContributors(repo: string): Promise<Contributor[]>
  /** Inicia sesión. Con OAuth real redirige y la promesa nunca resuelve. */
  login(): Promise<GitHubUser | null>
  logout(): Promise<void>
}

export interface StandupSource {
  /** Devuelve null cuando no hubo actividad con esos filtros (204). */
  generateStandup(request: StandupRequest, signal?: AbortSignal): Promise<StandupResponse | null>
}

export type ApiClient = GitHubSource & StandupSource

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}
