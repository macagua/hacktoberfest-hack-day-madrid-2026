import { useTranslation } from 'react-i18next'
import { cx } from '@/lib/cx'
import type { ScriptLine } from '@/types'
import styles from './Script.module.css'

interface ScriptProps {
  lines: ScriptLine[]
  activeIndex: number
}

export function Script({ lines, activeIndex }: ScriptProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.script}>
      <h3 className={styles.heading}>{t('result.script')}</h3>
      <ol className={styles.lines}>
        {lines.map((line, index) => {
          const active = index === activeIndex
          return (
            <li
              key={`${index}-${line.startSec}`}
              className={cx(
                styles.line,
                line.speaker === 'a' ? styles.speakerA : styles.speakerB,
                active && styles.active,
              )}
              aria-current={active ? 'true' : undefined}
            >
              <div className={styles.name}>{line.name}</div>
              <div className={styles.bubble}>{line.text}</div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
