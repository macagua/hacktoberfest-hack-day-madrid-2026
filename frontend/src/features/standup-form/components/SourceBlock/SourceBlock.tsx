import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Panel } from '@/components/Panel'
import { cx } from '@/lib/cx'
import form from '@/styles/form.module.css'
import type { Contributor, StandupOptions } from '@/types'
import { clampMax, MAX_CAP, MAX_MIN, SOURCES } from '../../lib/options'
import styles from './SourceBlock.module.css'

interface SourceBlockProps {
  options: StandupOptions
  onChange: (patch: Partial<StandupOptions>) => void
  contributors: Contributor[]
  /** Selector de repositorio. Lo arma quien usa el bloque, porque depende de la sesión de GitHub. */
  repoField: ReactNode
}

/** Bloque 01: repositorio, fuente, persona, rango de fechas y máximo. */
export function SourceBlock({ options, onChange, contributors, repoField }: SourceBlockProps) {
  const { t } = useTranslation()

  return (
    <Panel titleId="sfm-que" number="01" title={t('source.title')}>
      {repoField}

      <div className={form.field}>
        <span id="sfm-fuente-l" className={form.label}>
          {t('source.what')}
        </span>
        <div className={styles.tabs} role="group" aria-labelledby="sfm-fuente-l">
          {SOURCES.map((source) => {
            const on = options.source === source
            return (
              <button
                key={source}
                type="button"
                className={cx(styles.tab, on && styles.tabOn)}
                aria-pressed={on}
                onClick={() => onChange({ source })}
              >
                {t(`options.source.${source}`)}
              </button>
            )
          })}
        </div>
      </div>

      <div className={form.field}>
        <label htmlFor="sfm-persona" className={form.label}>
          {t('source.who')}
        </label>
        <select
          id="sfm-persona"
          className={styles.select}
          value={options.author ?? ''}
          onChange={(event) => onChange({ author: event.target.value || null })}
        >
          <option value="">{t('source.everyone')}</option>
          {contributors.map(({ login }) => (
            <option key={login} value={login}>
              @{login}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <div className={form.field}>
          <label htmlFor="sfm-desde" className={form.label}>
            {t('source.from')}
          </label>
          <input
            id="sfm-desde"
            type="date"
            className={form.control}
            value={options.from}
            max={options.to || undefined}
            onChange={(event) => onChange({ from: event.target.value })}
          />
        </div>
        <div className={form.field}>
          <label htmlFor="sfm-hasta" className={form.label}>
            {t('source.to')}
          </label>
          <input
            id="sfm-hasta"
            type="date"
            className={form.control}
            value={options.to}
            min={options.from || undefined}
            onChange={(event) => onChange({ to: event.target.value })}
          />
        </div>
        <div className={form.field}>
          <label htmlFor="sfm-max" className={form.label}>
            {t('source.max', { cap: MAX_CAP })}
          </label>
          <input
            id="sfm-max"
            type="number"
            inputMode="numeric"
            min={MAX_MIN}
            max={MAX_CAP}
            className={styles.max}
            value={options.max ?? ''}
            onChange={(event) => onChange({ max: clampMax(event.target.value) })}
          />
        </div>
      </div>
    </Panel>
  )
}
