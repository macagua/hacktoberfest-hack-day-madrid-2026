import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

export interface AudioPlayer {
  audioRef: RefObject<HTMLAudioElement | null>
  playing: boolean
  currentTime: number
  duration: number
  toggle: () => void
  seekBy: (seconds: number) => void
}

interface UseAudioPlayerOptions {
  /** Duración informada por el backend, por si el audio todavía no cargó sus metadatos. */
  fallbackDuration: number
  autoPlay?: boolean
}

function safePlay(audio: HTMLAudioElement): void {
  try {
    // Puede rechazarse si el navegador bloquea el autoplay: en ese caso queda en pausa.
    void Promise.resolve(audio.play()).catch(() => {})
  } catch {
    // jsdom y algunos navegadores viejos tiran en vez de devolver una promesa.
  }
}

/** Play/pausa, tiempo actual y saltos sobre un `<audio>` que hay que enganchar con `audioRef`. */
export function useAudioPlayer({
  fallbackDuration,
  autoPlay = false,
}: UseAudioPlayerOptions): AudioPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [mediaDuration, setMediaDuration] = useState<number | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => setCurrentTime(audio.currentTime)
    const onDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setMediaDuration(audio.duration)
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onPause)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('seeked', onTime)
    audio.addEventListener('loadedmetadata', onDuration)
    audio.addEventListener('durationchange', onDuration)
    if (autoPlay) safePlay(audio)

    return () => {
      audio.pause()
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onPause)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('seeked', onTime)
      audio.removeEventListener('loadedmetadata', onDuration)
      audio.removeEventListener('durationchange', onDuration)
    }
  }, [autoPlay])

  const duration = mediaDuration ?? fallbackDuration

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    if (audio.ended) audio.currentTime = 0
    safePlay(audio)
  }, [])

  const seekBy = useCallback(
    (seconds: number) => {
      const audio = audioRef.current
      if (!audio) return
      const next = Math.min(duration, Math.max(0, audio.currentTime + seconds))
      audio.currentTime = next
      setCurrentTime(next)
    },
    [duration],
  )

  return { audioRef, playing, currentTime, duration, toggle, seekBy }
}
