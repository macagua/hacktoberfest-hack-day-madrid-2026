import { useId } from 'react'
import { cx } from '@/lib/cx'
import form from '@/styles/form.module.css'
import styles from './ChipGroup.module.css'

interface ChipGroupProps<T extends string | number> {
  label: string
  values: readonly T[]
  selected: T
  getLabel: (value: T) => string
  onSelect: (value: T) => void
  /** `pill`: redondeado (tono). `square`: esquinas suaves (duración, idioma). */
  shape?: 'pill' | 'square'
  /** Texto en monoespaciada (duraciones). */
  mono?: boolean
}

/** Grupo de chips de selección única con `aria-pressed`. */
export function ChipGroup<T extends string | number>({
  label,
  values,
  selected,
  getLabel,
  onSelect,
  shape = 'square',
  mono = false,
}: ChipGroupProps<T>) {
  const labelId = useId()

  return (
    <div className={form.field}>
      <span id={labelId} className={form.label}>
        {label}
      </span>
      <div
        className={cx(styles.group, shape === 'pill' && styles.groupWide)}
        role="group"
        aria-labelledby={labelId}
      >
        {values.map((value) => {
          const on = value === selected
          return (
            <button
              key={value}
              type="button"
              className={cx(styles.chip, styles[shape], mono && styles.mono, on && styles.on)}
              aria-pressed={on}
              onClick={() => onSelect(value)}
            >
              {getLabel(value)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
