import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient, type ApiClient } from '@/api/client'
import { Header } from '@/components/Header'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import {
  createDefaultOptions,
  GenerateButton,
  SourceBlock,
  StyleBlock,
  toRequest,
} from '@/features/standup-form'
import { ResultZone, useStandup } from '@/features/standup-result'
import { currentUiLanguage } from '@/i18n'
import type { StandupOptions } from '@/types'
import styles from './App.module.css'

interface AppProps {
  /** Inyectable para tests; en la app real habla con el backend. */
  client?: ApiClient
}

export default function App({ client = apiClient }: AppProps) {
  const { t } = useTranslation()
  // El podcast arranca en el idioma de la interfaz; después se puede cambiar por separado.
  const [options, setOptions] = useState<StandupOptions>(() =>
    createDefaultOptions({ language: currentUiLanguage() }),
  )
  const [repoInvalid, setRepoInvalid] = useState(false)
  const repoInputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLElement>(null)

  const { result, generate } = useStandup(client.generateStandup)

  const updateOptions = useCallback((patch: Partial<StandupOptions>) => {
    setOptions((current) => ({ ...current, ...patch }))
    // Si está corrigiendo el repo, sacamos el aviso de error mientras escribe.
    if ('repo' in patch) setRepoInvalid(false)
  }, [])

  function focusRepo() {
    repoInputRef.current?.focus()
    repoInputRef.current?.select()
  }

  function run() {
    const request = toRequest(options)
    if (!request) {
      setRepoInvalid(true)
      focusRepo()
      return
    }
    generate(request)
    // En pantallas chicas el resultado queda abajo del pliegue: lo traemos a la vista.
    resultRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.app}>
      <div className={styles.inner}>
        <Header actions={<LanguageSwitcher />} />

        <div className={styles.blocks}>
          <SourceBlock
            options={options}
            onChange={updateOptions}
            repoInvalid={repoInvalid}
            repoInputRef={repoInputRef}
          />
          <StyleBlock options={options} onChange={updateOptions} />
        </div>

        <GenerateButton onClick={run} />

        <ResultZone ref={resultRef} result={result} onRetry={run} onChangeRepo={focusRepo} />

        <footer className={styles.footer}>{t('footer')}</footer>
      </div>
    </div>
  )
}
