import { describe, expect, it } from 'vitest'
import type { ScriptLine } from '@/types'
import { formatTime, getActiveLineIndex, splitIntoLines } from './script'

const line = (startSec: number): ScriptLine => ({ text: '…', startSec })

describe('splitIntoLines', () => {
  it('parte en frases y reparte el tiempo según la longitud', () => {
    // 10 + 20 caracteres en 30 s → la segunda empieza a los 10 s.
    const lines = splitIntoLines('Hola buen. Esto dura el doble ya.', 30)
    expect(lines.map((l) => l.text)).toEqual(['Hola buen.', 'Esto dura el doble ya.'])
    expect(lines[0]?.startSec).toBe(0)
    expect(lines[1]?.startSec).toBeCloseTo(9.4, 1)
  })

  it('reconoce signos de exclamación, pregunta y puntos suspensivos', () => {
    expect(splitIntoLines('¡Buenas! ¿Todo bien? Seguimos… Fin.', 10)).toHaveLength(4)
  })

  it('sin duración conocida deja todo en 0', () => {
    expect(splitIntoLines('Una. Dos.', 0).map((l) => l.startSec)).toEqual([0, 0])
  })

  it('con texto vacío no devuelve líneas', () => {
    expect(splitIntoLines('   ', 30)).toEqual([])
  })
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
