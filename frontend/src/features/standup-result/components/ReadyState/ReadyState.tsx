import { useTranslation } from 'react-i18next'
import { describeRequest } from '@/features/standup-form'
import type { StandupRequest, StandupResponse } from '@/types'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { getActiveLineIndex } from '../../lib/script'
import { Player } from '../Player'
import { Script } from '../Script'
import styles from './ReadyState.module.css'

interface ReadyStateProps {
  data: StandupResponse
  request: StandupRequest
}

/** Standup listo: reproductor arriba y guion sincronizado abajo. */
export function ReadyState({ data, request }: ReadyStateProps) {
  const { t } = useTranslation()
  const player = useAudioPlayer({ fallbackDuration: data.durationSec, autoPlay: true })
  const activeIndex = getActiveLineIndex(data.lines, player.currentTime)
  const downloadName = `standup-fm-${request.repo.replace('/', '-')}.mp3`

  return (
    <div className={styles.ready}>
      <Player
        player={player}
        audioUrl={data.audioUrl}
        meta={describeRequest(request, t)}
        downloadName={downloadName}
      />
      <Script lines={data.lines} activeIndex={activeIndex} />
    </div>
  )
}
