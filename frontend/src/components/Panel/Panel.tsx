import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react'
import { cx } from '@/lib/cx'
import styles from './Panel.module.css'

interface PanelProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** id del título; la sección queda etiquetada con él (`aria-labelledby`). */
  titleId: string
  /** Numerito decorativo de la cabecera: "01", "02"… */
  number: string
  title: ReactNode
  /** Contenido a la derecha del título (por ejemplo, el botón Aleatorio). */
  actions?: ReactNode
  ref?: Ref<HTMLElement>
}

/** Bloque numerado de la pantalla (01 Qué resumimos, 02 Cómo lo contamos, 03 Al aire). */
export function Panel({
  titleId,
  number,
  title,
  actions,
  className,
  children,
  ref,
  ...sectionProps
}: PanelProps) {
  return (
    <section
      ref={ref}
      aria-labelledby={titleId}
      className={cx(styles.panel, className)}
      {...sectionProps}
    >
      <div className={styles.headingRow}>
        <div className={styles.heading}>
          <span className={styles.number} aria-hidden="true">
            {number}
          </span>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}
