import { useTranslation } from 'react-i18next'
import { WIDE_RANGE_DAYS } from '@/features/standup-form'
import states from '../../styles/states.module.css'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  onWiden: () => void
}

const FLAT_BARS = 7

export function EmptyState({ onWiden }: EmptyStateProps) {
  const { t } = useTranslation()

  return (
    <div role="status" className={styles.box}>
      <div className={styles.flatline} aria-hidden="true">
        {Array.from({ length: FLAT_BARS }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className={states.title}>{t('result.empty.title')}</div>
      <p className={states.text}>{t('result.empty.text')}</p>
      <button type="button" className={styles.widen} onClick={onWiden}>
        {t('result.empty.widen', { days: WIDE_RANGE_DAYS })}
      </button>
    </div>
  )
}
