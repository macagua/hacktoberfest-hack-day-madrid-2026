import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import { FORMATS, pickRandom, TONES } from '../../lib/options'
import type { Format, Tone } from '@/types'
import { DiceIcon } from '@/components/icons'
import styles from './RandomButton.module.css'

const ROLL_STEPS = 12
const ROLL_INTERVAL_MS = 90

interface RandomButtonProps {
  /** Se llama en cada paso del sorteo; el último valor es el que queda. */
  onRoll: (pick: { tone: Tone; format: Format }) => void
}

export function RandomButton({ onRoll }: RandomButtonProps) {
  const { t } = useTranslation()
  const [rolling, setRolling] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
    },
    [],
  )

  function roll() {
    if (timerRef.current !== null) return
    setRolling(true)
    let step = 0
    timerRef.current = window.setInterval(() => {
      step += 1
      onRoll({ tone: pickRandom(TONES), format: pickRandom(FORMATS) })
      if (step >= ROLL_STEPS && timerRef.current !== null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
        setRolling(false)
      }
    }, ROLL_INTERVAL_MS)
  }

  return (
    <button type="button" className={styles.button} onClick={roll} aria-busy={rolling}>
      <DiceIcon className={cx(rolling && styles.rolling)} />
      <span>{t('style.random')}</span>
    </button>
  )
}
