import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { describeRequest } from '@/features/standup-form'
import type { StandupRequest, StandupResult } from '@/types'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { getActiveLineIndex, splitIntoLines } from '../../lib/script'
import { AudioUnavailable } from '../AudioUnavailable'
import { Player } from '../Player'
import { PrList } from '../PrList'
import { Script } from '../Script'
import styles from './ReadyState.module.css'

interface ReadyStateProps {
  data: StandupResult
  request: StandupRequest
}

/** Standup listo: reproductor (o aviso si no hay voz), guion narrado y PRs por prioridad. */
export function ReadyState({ data, request }: ReadyStateProps) {
  const { t } = useTranslation()
  // La duración real sale de los metadatos del MP3; hasta que cargan, 0.
  const player = useAudioPlayer({ fallbackDuration: 0, autoPlay: true })
  const lines = useMemo(
    () => splitIntoLines(data.summary, player.duration),
    [data.summary, player.duration],
  )

  const title = t('result.player.title', { repo: data.repo })
  const meta = describeRequest(request, t)
  const activeIndex = data.audio ? getActiveLineIndex(lines, player.currentTime) : null

  return (
    <div className={styles.ready}>
      {data.audio ? (
        <Player
          player={player}
          audioUrl={data.audio.src}
          title={title}
          meta={meta}
          downloadName={`standup-fm-${data.repo.replace('/', '-')}.mp3`}
        />
      ) : (
        <AudioUnavailable title={title} meta={meta} reason={data.audioError} />
      )}
      <Script lines={lines} activeIndex={activeIndex} />
      <PrList prs={data.prs} totalOpen={data.totalOpen} />
    </div>
  )
}
