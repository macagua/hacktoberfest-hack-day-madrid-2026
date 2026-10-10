import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient, type ApiClient } from '@/api/client'
import { Header } from '@/components/Header'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { RepoSelect, SessionButton, useGitHub } from '@/features/github'
import {
  createDefaultOptions,
  daysAgo,
  GenerateButton,
  SourceBlock,
  StyleBlock,
  toISODate,
  toRequest,
  WIDE_RANGE_DAYS,
} from '@/features/standup-form'
import { ResultZone, useStandup } from '@/features/standup-result'
import { currentUiLanguage } from '@/i18n'
import type { StandupOptions } from '@/types'
import styles from './App.module.css'

interface AppProps {
  /** Inyectable para tests; en la app real sale de las variables de entorno. */
  client?: ApiClient
}

export default function App({ client = apiClient }: AppProps) {
  const { t } = useTranslation()
  // El podcast arranca en el idioma de la interfaz; después se puede cambiar por separado.
  const [options, setOptions] = useState<StandupOptions>(() =>
    createDefaultOptions({ language: currentUiLanguage() }),
  )
  const [repoOpen, setRepoOpen] = useState(false)
  const resultRef = useRef<HTMLElement>(null)

  const github = useGitHub(client, options.repo)
  const { result, generate } = useStandup(client.generateStandup)
  const connected = github.session.status === 'conectado'

  const updateOptions = useCallback((patch: Partial<StandupOptions>) => {
    setOptions((current) => ({ ...current, ...patch }))
  }, [])

  function run(next: StandupOptions) {
    if (!connected) {
      github.connect()
      return
    }
    const request = toRequest({ ...next, repo: github.selectedRepo })
    if (!request) {
      setRepoOpen(true)
      return
    }
    setRepoOpen(false)
    generate(request)
    // En pantallas chicas el resultado queda abajo del pliegue: lo traemos a la vista.
    resultRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }

  function widenAndRetry() {
    const now = new Date()
    const patch = { from: daysAgo(WIDE_RANGE_DAYS, now), to: toISODate(now) }
    updateOptions(patch)
    run({ ...options, ...patch })
  }

  return (
    <div className={styles.app}>
      <div className={styles.inner}>
        <Header
          actions={
            <>
              <LanguageSwitcher />
              <SessionButton
                session={github.session}
                onConnect={github.connect}
                onDisconnect={github.disconnect}
              />
            </>
          }
        />

        <div className={styles.blocks}>
          <SourceBlock
            options={options}
            onChange={updateOptions}
            contributors={github.contributors}
            repoField={
              <RepoSelect
                connected={connected}
                repos={github.repos}
                selected={github.selectedRepo}
                open={repoOpen}
                onOpenChange={setRepoOpen}
                // Al cambiar de repo, los colaboradores son otros: volvemos a "Todo el equipo".
                onSelect={(repo) => updateOptions({ repo, author: null })}
                onConnect={github.connect}
              />
            }
          />
          <StyleBlock options={options} onChange={updateOptions} />
        </div>

        <GenerateButton onClick={() => run(options)} />

        <ResultZone
          ref={resultRef}
          result={result}
          onRetry={() => run(options)}
          onWiden={widenAndRetry}
        />

        <footer className={styles.footer}>{t('footer')}</footer>
      </div>
    </div>
  )
}
