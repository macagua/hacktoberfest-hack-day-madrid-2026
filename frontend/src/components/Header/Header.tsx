import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Header.module.css'

interface HeaderProps {
  /** Controles de la esquina superior derecha (idioma, sesión…). */
  actions?: ReactNode
}

const DIAL_MARKS = ['88', '92', '96', '100', '104', '108']

export function Header({ actions }: HeaderProps) {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.onAir}>
          <span className={styles.dot} aria-hidden="true" />
          <span>{t('header.onAir')}</span>
        </div>
        <div className={styles.actions}>{actions}</div>
      </div>

      <div className={styles.titleBlock}>
        <h1 className={styles.title}>
          Standup <span className={styles.titleAccent}>FM</span>
        </h1>
        <p className={styles.subtitle}>{t('header.subtitle')}</p>
      </div>

      <div className={styles.dial} aria-hidden="true">
        <div className={styles.scale}>
          <div className={styles.needle} />
        </div>
        <div className={styles.marks}>
          {DIAL_MARKS.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </div>
      </div>
    </header>
  )
}
