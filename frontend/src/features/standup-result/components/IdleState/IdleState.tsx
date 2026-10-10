import { useTranslation } from 'react-i18next'
import styles from './IdleState.module.css'

export function IdleState() {
  const { t } = useTranslation()

  return (
    <div className={styles.box}>
      <div className={styles.title}>{t('result.idle.title')}</div>
      <p className={styles.text}>{t('result.idle.text')}</p>
    </div>
  )
}
