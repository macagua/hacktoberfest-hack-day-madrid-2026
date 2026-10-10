import { describe, expect, it } from 'vitest'
import type { ScriptLine } from '@/types'
import { formatTime, getActiveLineIndex } from './script'

const line = (startSec: number): ScriptLine => ({
  speaker: 'a',
  name: 'Tincho',
  text: '…',
  startSec,
})

describe('getActiveLineIndex', () => {
  const lines = [line(0), line(7.5), line(15), line(22.5)]

  it('devuelve -1 con el guion vacío', () => {
    expect(getActiveLineIndex([], 10)).toBe(-1)
  })

  it.each([
    [0, 0],
    [3, 0],
    [7.5, 1],
    [14.99, 1],
    [15, 2],
    [60, 3],
  ])('en t=%d resalta la línea %d', (time, expected) => {
    expect(getActiveLineIndex(lines, time)).toBe(expected)
  })

  it('resalta la primera aunque arranque más tarde', () => {
    expect(getActiveLineIndex([line(2), line(5)], 0)).toBe(0)
  })
})

describe('formatTime', () => {
  it.each([
    [0, '0:00'],
    [9.9, '0:09'],
    [75, '1:15'],
    [120, '2:00'],
    [Number.NaN, '0:00'],
    [-3, '0:00'],
  ])('%d → %s', (seconds, expected) => {
    expect(formatTime(seconds)).toBe(expected)
  })
})
