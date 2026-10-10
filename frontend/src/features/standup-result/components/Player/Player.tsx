import { useTranslation } from 'react-i18next'
import { DownloadIcon, PauseIcon, PlayIcon } from '@/components/icons'
import { cx } from '@/lib/cx'
import type { AudioPlayer } from '../../hooks/useAudioPlayer'
import { formatTime } from '../../lib/script'
import styles from './Player.module.css'

interface PlayerProps {
  player: AudioPlayer
  audioUrl: string
  meta: string
  downloadName: string
}

const SKIP_SECONDS = 10
const WAVE_BARS = 48

// Forma de onda decorativa (el backend no manda picos): mismas alturas que la referencia.
const WAVE_HEIGHTS = Array.from(
  { length: WAVE_BARS },
  (_, j) => `${(16 + 84 * Math.abs(Math.sin(j * 1.7) * Math.cos(j * 0.37 + 1))).toFixed(0)}%`,
)

export function Player({ player, audioUrl, meta, downloadName }: PlayerProps) {
  const { t } = useTranslation()
  const { audioRef, playing, currentTime, duration, toggle, seekBy } = player
  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <div className={styles.player}>
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      <div className={styles.top}>
        <div className={styles.titles}>
          <div className={styles.title}>{t('result.player.title')}</div>
          <div className={styles.meta}>{meta}</div>
        </div>
        <a className={styles.download} href={audioUrl} download={downloadName}>
          <DownloadIcon />
          <span>{t('result.player.download')}</span>
        </a>
      </div>

      <div className={styles.main}>
        <button
          type="button"
          className={styles.play}
          onClick={toggle}
          aria-label={playing ? t('result.player.pause') : t('result.player.play')}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className={styles.wave} aria-hidden="true">
          {WAVE_HEIGHTS.map((height, j) => (
            <div
              key={j}
              className={cx(styles.waveBar, (j + 0.5) / WAVE_BARS <= progress && styles.wavePlayed)}
              style={{ height }}
            />
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.time}>
          <span>{formatTime(currentTime)}</span>
          <span className={styles.total}> / {formatTime(duration)}</span>
        </div>
        <div className={styles.skips}>
          <button
            type="button"
            className={styles.skip}
            onClick={() => seekBy(-SKIP_SECONDS)}
            aria-label={t('result.player.back', { seconds: SKIP_SECONDS })}
          >
            −{SKIP_SECONDS} s
          </button>
          <button
            type="button"
            className={styles.skip}
            onClick={() => seekBy(SKIP_SECONDS)}
            aria-label={t('result.player.forward', { seconds: SKIP_SECONDS })}
          >
            +{SKIP_SECONDS} s
          </button>
        </div>
      </div>
    </div>
  )
}
