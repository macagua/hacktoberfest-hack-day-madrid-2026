import type { ScriptLine } from '@/types'

/**
 * Parte el resumen narrado en frases y estima cuándo empieza cada una dentro del audio.
 * El backend no manda tiempos, así que repartimos la duración en proporción a la longitud
 * de cada frase: a ritmo de locución constante es una aproximación bastante fiel.
 */
export function splitIntoLines(summary: string, durationSec: number): ScriptLine[] {
  const sentences = summary
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  const totalChars = sentences.reduce((sum, sentence) => sum + sentence.length, 0)
  const secondsPerChar = totalChars > 0 && durationSec > 0 ? durationSec / totalChars : 0

  let elapsedChars = 0
  return sentences.map((text) => {
    const startSec = Math.round(elapsedChars * secondsPerChar * 10) / 10
    elapsedChars += text.length
    return { text, startSec }
  })
}

/**
 * Índice de la línea del guion que está sonando: la última cuyo `startSec` ya pasó.
 * Antes de que arranque la primera se resalta la primera. Con guion vacío devuelve -1.
 * Asume las líneas ordenadas por `startSec`.
 */
export function getActiveLineIndex(lines: readonly ScriptLine[], currentTime: number): number {
  if (lines.length === 0) return -1
  let active = 0
  for (const [index, line] of lines.entries()) {
    if (line.startSec > currentTime) break
    active = index
  }
  return active
}

/** 75 → "1:15". */
export function formatTime(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
