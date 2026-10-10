import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './ComingSoon.module.css'

interface ComingSoonProps {
  children: ReactNode
}

/**
 * Agrupa controles que todavía no tienen soporte en el backend.
 * El `fieldset disabled` los desactiva a todos (ratón, teclado y lectores de pantalla).
 */
export function ComingSoon({ children }: ComingSoonProps) {
  const { t } = useTranslation()

  return (
    <fieldset
      className={styles.soon}
      disabled
      title={t('soon.tooltip')}
      data-tooltip={t('soon.tooltip')}
    >
      <legend className={styles.legend}>
        <span className={styles.badge}>{t('soon.badge')}</span>
        <span className={styles.hint}>{t('soon.hint')}</span>
      </legend>
      {children}
    </fieldset>
  )
}
