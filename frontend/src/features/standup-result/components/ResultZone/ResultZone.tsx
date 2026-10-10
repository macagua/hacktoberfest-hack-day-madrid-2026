import type { Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { Panel } from '@/components/Panel'
import type { ResultState } from '@/types'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { IdleState } from '../IdleState'
import { LoadingState } from '../LoadingState'
import { ReadyState } from '../ReadyState'
import styles from './ResultZone.module.css'

interface ResultZoneProps {
  result: ResultState
  onRetry: () => void
  /** Lleva a la persona al campo de repositorio para probar con otro. */
  onChangeRepo: () => void
  ref?: Ref<HTMLElement>
}

/** Bloque 03: muestra el estado de la generación. Anuncia los cambios a lectores de pantalla. */
export function ResultZone({ result, onRetry, onChangeRepo, ref }: ResultZoneProps) {
  const { t } = useTranslation()

  return (
    <Panel
      ref={ref}
      titleId="sfm-res"
      number="03"
      title={t('result.title')}
      className={styles.zone}
      aria-live="polite"
    >
      {result.status === 'vacio' && <IdleState />}
      {result.status === 'cargando' && <LoadingState />}
      {result.status === 'listo' && (
        // La key fuerza un reproductor nuevo (tiempo en 0) con cada standup.
        <ReadyState key={result.data.generatedAt} data={result.data} request={result.request} />
      )}
      {result.status === 'error' && (
        <ErrorState kind={result.kind} onRetry={onRetry} onChangeRepo={onChangeRepo} />
      )}
      {result.status === 'sin-resultados' && <EmptyState onChangeRepo={onChangeRepo} />}
    </Panel>
  )
}
