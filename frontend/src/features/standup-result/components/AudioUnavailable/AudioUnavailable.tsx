import { useTranslation } from 'react-i18next'
import { MicOffIcon } from '@/components/icons'
import styles from './AudioUnavailable.module.css'

interface AudioUnavailableProps {
  title: string
  meta: string
  /** Motivo técnico que manda el backend (por ejemplo, falta la clave de ElevenLabs). */
  reason: string | null
}

/** Ocupa el lugar del reproductor cuando el backend no pudo generar la voz. */
export function AudioUnavailable({ title, meta, reason }: AudioUnavailableProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.card} role="note">
      <div className={styles.titles}>
        <div className={styles.title}>{title}</div>
        <div className={styles.meta}>{meta}</div>
      </div>
      <div className={styles.notice}>
        <MicOffIcon />
        <div>
          <p className={styles.text}>{t('result.noAudio.text')}</p>
          {reason && <p className={styles.reason}>{reason}</p>}
        </div>
      </div>
    </div>
  )
}
