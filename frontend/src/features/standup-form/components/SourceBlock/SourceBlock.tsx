import type { Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { ComingSoon } from '@/components/ComingSoon'
import { Panel } from '@/components/Panel'
import { cx } from '@/lib/cx'
import form from '@/styles/form.module.css'
import type { StandupOptions } from '@/types'
import { clampMax, MAX_CAP, MAX_MIN, SOURCES } from '../../lib/options'
import { RepoInput } from '../RepoInput'
import styles from './SourceBlock.module.css'

interface SourceBlockProps {
  options: StandupOptions
  onChange: (patch: Partial<StandupOptions>) => void
  /** Marca el campo de repositorio como inválido. */
  repoInvalid: boolean
  repoInputRef?: Ref<HTMLInputElement>
}

/** Bloque 01: repositorio y máximo de PRs; fuente, persona y fechas quedan para más adelante. */
export function SourceBlock({ options, onChange, repoInvalid, repoInputRef }: SourceBlockProps) {
  const { t } = useTranslation()

  return (
    <Panel titleId="sfm-que" number="01" title={t('source.title')}>
      <RepoInput
        ref={repoInputRef}
        value={options.repo}
        invalid={repoInvalid}
        onChange={(repo) => onChange({ repo })}
      />

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

      <ComingSoon>
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
          <select id="sfm-persona" className={styles.select} value="">
            <option value="">{t('source.everyone')}</option>
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
              readOnly
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
              readOnly
            />
          </div>
        </div>
      </ComingSoon>
    </Panel>
  )
}
