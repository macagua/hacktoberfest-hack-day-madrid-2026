import { useTranslation } from 'react-i18next'
import { cx } from '@/lib/cx'
import type { ScriptLine } from '@/types'
import styles from './Script.module.css'

interface ScriptProps {
  lines: ScriptLine[]
  /** Frase que está sonando. null = no hay audio sonando: todas se ven igual. */
  activeIndex: number | null
}

/** Guion narrado, frase a frase, con la que está sonando resaltada. */
export function Script({ lines, activeIndex }: ScriptProps) {
  const { t } = useTranslation()
  const following = activeIndex !== null

  return (
    <div className={styles.script}>
      <h3 className={styles.heading}>{t('result.script')}</h3>
      <div className={styles.name}>{t('result.narrator')}</div>
      <ol className={styles.lines}>
        {lines.map((line, index) => {
          const active = index === activeIndex
          return (
            <li
              key={`${index}-${line.startSec}`}
              className={cx(
                styles.line,
                following && !active && styles.dimmed,
                active && styles.active,
              )}
              aria-current={active ? 'true' : undefined}
            >
              {line.text}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
