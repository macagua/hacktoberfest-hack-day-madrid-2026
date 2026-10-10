import type { ScriptLine } from '@/types'

/**
 * Índice de la línea del guion que está sonando: la última cuyo `startSec` ya pasó.
 * Antes de que arranque la primera se resalta la primera. Con guion vacío devuelve -1.
 * Asume las líneas ordenadas por `startSec`, como las manda el backend.
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
