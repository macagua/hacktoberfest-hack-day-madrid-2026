import { parseGitHubContributors, parseGitHubRepos, parseGitHubUser } from './parse'
import { HttpError, type GitHubSource } from './types'

// Acceso directo a la API REST de GitHub desde el navegador, con un token personal.
// Sirve para desarrollar y probar con repos reales mientras el backend no está listo.
//
// Por qué no sirve para producción: el login con GitHub (OAuth) necesita el client secret
// para canjear el código por un token, y ese secreto no puede vivir en el front. Además,
// cualquier VITE_* queda visible en el bundle. En producción esto lo hace el backend.

const GITHUB_API = 'https://api.github.com'
const PER_PAGE = 100

export function createDirectGitHub(token: string): GitHubSource {
  // GitHub no tiene "cerrar sesión" para un token personal: lo simulamos en memoria.
  let signedOut = false

  async function call(path: string): Promise<Response> {
    return fetch(`${GITHUB_API}${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
  }

  async function getJson(path: string): Promise<unknown> {
    const res = await call(path)
    if (!res.ok) throw new HttpError(res.status, `GitHub ${path} respondió ${res.status}`)
    return res.json()
  }

  async function getMe() {
    if (signedOut) return null
    const res = await call('/user')
    if (res.status === 401) return null
    if (!res.ok) throw new HttpError(res.status, `GitHub /user respondió ${res.status}`)
    return parseGitHubUser(await res.json())
  }

  return {
    getMe,

    async getRepos() {
      // Solo la primera página (los 100 con actividad más reciente): alcanza para el selector.
      const params = new URLSearchParams({
        per_page: String(PER_PAGE),
        sort: 'pushed',
        affiliation: 'owner,collaborator,organization_member',
      })
      return parseGitHubRepos(await getJson(`/user/repos?${params.toString()}`))
    },

    async getContributors(repo) {
      const [owner, name] = repo.split('/')
      if (!owner || !name) throw new Error(`Repo inválido: ${repo}`)
      const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/contributors?per_page=${PER_PAGE}`
      const res = await call(path)
      // GitHub responde 204 cuando el repo está vacío.
      if (res.status === 204) return []
      if (!res.ok) throw new HttpError(res.status, `GitHub ${path} respondió ${res.status}`)
      return parseGitHubContributors(await res.json())
    },

    async login() {
      signedOut = false
      return getMe()
    },

    async logout() {
      signedOut = true
    },
  }
}
