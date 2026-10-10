import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { DocumentaryIcon, FootballIcon, NewsIcon, PodcastIcon } from '@/components/icons'
import { Panel } from '@/components/Panel'
import { cx } from '@/lib/cx'
import form from '@/styles/form.module.css'
import type { Format, StandupOptions } from '@/types'
import { DURATIONS, FORMATS, LANGUAGES, TONES } from '../../lib/options'
import { ChipGroup } from '../ChipGroup'
import { RandomButton } from '../RandomButton'
import styles from './StyleBlock.module.css'

interface StyleBlockProps {
  options: StandupOptions
  onChange: (patch: Partial<StandupOptions>) => void
}

const FORMAT_ICONS: Record<Format, () => ReactElement> = {
  podcast: PodcastIcon,
  noticiero: NewsIcon,
  futbol: FootballIcon,
  documental: DocumentaryIcon,
}

/** Bloque 02: tono, formato, duración e idioma del podcast. */
export function StyleBlock({ options, onChange }: StyleBlockProps) {
  const { t } = useTranslation()

  return (
    <Panel
      titleId="sfm-como"
      number="02"
      title={t('style.title')}
      actions={<RandomButton onRoll={onChange} />}
    >
      <ChipGroup
        label={t('style.tone')}
        values={TONES}
        selected={options.tone}
        getLabel={(tone) => t(`options.tone.${tone}`)}
        onSelect={(tone) => onChange({ tone })}
        shape="pill"
      />

      <div className={form.field}>
        <span id="sfm-formato-l" className={form.label}>
          {t('style.format')}
        </span>
        <div className={styles.cards} role="group" aria-labelledby="sfm-formato-l">
          {FORMATS.map((format) => {
            const on = options.format === format
            const Icon = FORMAT_ICONS[format]
            return (
              <button
                key={format}
                type="button"
                className={cx(styles.card, on && styles.on)}
                aria-pressed={on}
                onClick={() => onChange({ format })}
              >
                <Icon />
                <span>{t(`options.format.${format}`)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.row}>
        <ChipGroup
          label={t('style.duration')}
          values={DURATIONS}
          selected={options.duration}
          getLabel={(duration) => t(`options.duration.${duration}`)}
          onSelect={(duration) => onChange({ duration })}
          mono
        />
        <ChipGroup
          label={t('style.language')}
          values={LANGUAGES}
          selected={options.language}
          getLabel={(language) => t(`options.language.${language}`)}
          onSelect={(language) => onChange({ language })}
        />
      </div>
    </Panel>
  )
}
