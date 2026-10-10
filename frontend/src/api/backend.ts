import type { StandupRequest, StandupResponse } from '@/types'
import { parseContributors, parseRepos, parseStandupResponse, parseUser } from './parse'
import { HttpError, type GitHubSource, type StandupSource } from './types'

// Cliente del backend en Python. El contrato está en frontend/README.md («Contrato con el backend»).
// La sesión de GitHub vive en una cookie que pone el backend tras el OAuth, por eso `credentials: 'include'`.

const API_BASE = '/api'

async function call(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  })
}

async function getJson(path: string): Promise<unknown> {
  const res = await call(path)
  if (!res.ok) throw new HttpError(res.status, `GET ${path} respondió ${res.status}`)
  return res.json()
}

function repoPath(repo: string): string {
  return repo.split('/').map(encodeURIComponent).join('/')
}

export const backendGitHub: GitHubSource = {
  async getMe() {
    const res = await call('/me')
    if (res.status === 401) return null
    if (!res.ok) throw new HttpError(res.status, `GET /me respondió ${res.status}`)
    return parseUser(await res.json())
  },

  async getRepos() {
    return parseRepos(await getJson('/repos'))
  },

  async getContributors(repo) {
    return parseContributors(await getJson(`/repos/${repoPath(repo)}/contributors`))
  },

  login() {
    // El backend hace todo el OAuth y vuelve a la app con la cookie de sesión puesta.
    window.location.assign(`${API_BASE}/auth/github`)
    return new Promise<never>(() => {})
  },

  async logout() {
    // PENDIENTE (backend): este endpoint no está en el contrato todavía. Acordar con el equipo de back.
    await call('/auth/logout', { method: 'POST' })
  },
}

export const backendStandup: StandupSource = {
  async generateStandup(
    request: StandupRequest,
    signal?: AbortSignal,
  ): Promise<StandupResponse | null> {
    const res = await call('/standup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    })
    if (res.status === 204) return null
    if (!res.ok) throw new HttpError(res.status, `POST /standup respondió ${res.status}`)
    return parseStandupResponse(await res.json())
  },
}
