import { useTranslation } from 'react-i18next'
import { MicOffIcon } from '@/components/icons'
import type { StandupErrorKind } from '@/types'
import states from '../../styles/states.module.css'
import styles from './ErrorState.module.css'

interface ErrorStateProps {
  kind: StandupErrorKind
  onRetry: () => void
  onChangeRepo: () => void
}

/** Errores que se arreglan cambiando el repo, no reintentando. */
const REPO_ERRORS: readonly StandupErrorKind[] = ['repo-no-encontrado', 'repo-invalido']

export function ErrorState({ kind, onRetry, onChangeRepo }: ErrorStateProps) {
  const { t } = useTranslation()
  const isRepoError = REPO_ERRORS.includes(kind)

  return (
    <div role="alert" className={styles.box}>
      <MicOffIcon />
      <div className={states.title}>{t('result.error.title')}</div>
      <p className={states.text}>{t(`result.error.kind.${kind}`)}</p>
      {isRepoError ? (
        <button type="button" className={styles.retry} onClick={onChangeRepo}>
          {t('result.error.changeRepo')}
        </button>
      ) : (
        <button type="button" className={styles.retry} onClick={onRetry}>
          {t('result.error.retry')}
        </button>
      )}
    </div>
  )
}
