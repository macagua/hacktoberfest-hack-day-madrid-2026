import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GitHubSource } from '@/api/client'
import type { Contributor, GitHubUser, Repo, Session } from '@/types'

export type ReposState =
  { status: 'cargando' } | { status: 'listo'; repos: Repo[] } | { status: 'error' }

export interface UseGitHub {
  session: Session
  repos: ReposState
  /** El repo elegido, o el primero de la lista si todavía no se eligió ninguno. */
  selectedRepo: string | null
  contributors: Contributor[]
  connect: () => void
  disconnect: () => void
}

export const githubKeys = {
  all: ['github'] as const,
  me: () => [...githubKeys.all, 'me'] as const,
  repos: (login: string) => [...githubKeys.all, 'repos', login] as const,
  contributors: (repo: string) => [...githubKeys.all, 'contributors', repo] as const,
}

const NO_CONTRIBUTORS: Contributor[] = []

export function useGitHub(client: GitHubSource, preferredRepo: string | null): UseGitHub {
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: githubKeys.me(),
    queryFn: () => client.getMe(),
    // Un 401 ya vuelve como null; si falla otra cosa, mostramos "Conectar" sin reintentar.
    retry: false,
    staleTime: Infinity,
  })

  const session: Session = meQuery.isPending
    ? { status: 'cargando' }
    : meQuery.data
      ? { status: 'conectado', user: meQuery.data }
      : { status: 'desconectado' }

  const login = session.status === 'conectado' ? session.user.login : null

  const reposQuery = useQuery({
    queryKey: githubKeys.repos(login ?? ''),
    queryFn: () => client.getRepos(),
    enabled: login !== null,
  })

  const repos: ReposState = reposQuery.isPending
    ? { status: 'cargando' }
    : reposQuery.isError
      ? { status: 'error' }
      : { status: 'listo', repos: reposQuery.data }

  const repoList = repos.status === 'listo' ? repos.repos : []
  const selectedRepo = repoList.some((repo) => repo.fullName === preferredRepo)
    ? preferredRepo
    : (repoList[0]?.fullName ?? null)

  const contributorsQuery = useQuery({
    queryKey: githubKeys.contributors(selectedRepo ?? ''),
    queryFn: () => client.getContributors(selectedRepo ?? ''),
    enabled: selectedRepo !== null,
  })
  // Sin colaboradores igual se puede generar para "Todo el equipo".
  const contributors = contributorsQuery.data ?? NO_CONTRIBUTORS

  const connectMutation = useMutation({
    mutationFn: () => client.login(),
    onSuccess: (user) => queryClient.setQueryData<GitHubUser | null>(githubKeys.me(), user),
  })

  const disconnectMutation = useMutation({
    mutationFn: () => client.logout(),
    onSuccess: () => {
      queryClient.setQueryData<GitHubUser | null>(githubKeys.me(), null)
      queryClient.removeQueries({ queryKey: [...githubKeys.all, 'repos'] })
      queryClient.removeQueries({ queryKey: [...githubKeys.all, 'contributors'] })
    },
  })

  return {
    session,
    repos,
    selectedRepo,
    contributors,
    connect: () => connectMutation.mutate(),
    disconnect: () => disconnectMutation.mutate(),
  }
}
