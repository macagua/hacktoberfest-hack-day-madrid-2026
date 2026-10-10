import { useTranslation } from 'react-i18next'
import { MicOffIcon } from '@/components/icons'
import states from '../../styles/states.module.css'
import styles from './ErrorState.module.css'

interface ErrorStateProps {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  const { t } = useTranslation()

  return (
    <div role="alert" className={styles.box}>
      <MicOffIcon />
      <div className={states.title}>{t('result.error.title')}</div>
      <p className={states.text}>{t('result.error.text')}</p>
      <button type="button" className={styles.retry} onClick={onRetry}>
        {t('result.error.retry')}
      </button>
    </div>
  )
}
