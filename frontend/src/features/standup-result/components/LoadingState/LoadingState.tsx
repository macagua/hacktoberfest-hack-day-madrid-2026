import { useEffect, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LoadingState.module.css'

const MESSAGE_INTERVAL_MS = 1300
const BAR_COUNT = 28

// Mismas alturas, retrasos y colores que la referencia.
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => ({
  height: `${40 + 60 * Math.abs(Math.sin(i * 1.3))}%`,
  delay: `${(-(i % 7) * 0.16 - i * 0.03).toFixed(2)}s`,
  secondary: i % 5 === 2,
}))

export function LoadingState() {
  const { t } = useTranslation()
  const messages = t('result.loading.messages', { returnObjects: true })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), MESSAGE_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className={styles.loading}>
      <div className={styles.bars} aria-hidden="true">
        {BARS.map((bar, i) => (
          <div
            key={i}
            className={styles.bar}
            style={
              {
                height: bar.height,
                animationDelay: bar.delay,
                background: bar.secondary ? 'var(--color-secondary)' : 'var(--color-accent)',
              } satisfies CSSProperties
            }
          />
        ))}
      </div>
      <div role="status" className={styles.message}>
        {messages[tick % messages.length]}
      </div>
      <div className={styles.hint}>{t('result.loading.hint')}</div>
    </div>
  )
}
