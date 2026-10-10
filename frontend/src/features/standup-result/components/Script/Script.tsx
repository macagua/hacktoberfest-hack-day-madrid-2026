import { useState } from 'react'
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
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = lines.map((l) => `**${l.name}**: ${l.text}`).join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.script}>
      <div className={styles.header}>
        <h3 className={styles.heading}>{t('result.script')}</h3>
        <button
          type="button"
          onClick={handleCopy}
          className={styles.copyButton}
          title={copied ? t('result.copiedScript') : t('result.copyScript')}
        >
          {copied ? t('result.copiedScript') : t('result.copyScript')}
        </button>
      </div>
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
