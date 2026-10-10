import { useTranslation } from 'react-i18next'
import states from '../../styles/states.module.css'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  onChangeRepo: () => void
}

const FLAT_BARS = 7

/** El repo existe pero no tiene pull requests abiertas. */
export function EmptyState({ onChangeRepo }: EmptyStateProps) {
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
      <button type="button" className={styles.widen} onClick={onChangeRepo}>
        {t('result.empty.changeRepo')}
      </button>
    </div>
  )
}
