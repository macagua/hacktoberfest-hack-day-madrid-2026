import { describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import {
  clampMax,
  createDefaultOptions,
  daysAgo,
  describeRequest,
  pickRandom,
  TONES,
  toRequest,
} from './options'

describe('clampMax', () => {
  it.each([
    ['30', 30],
    ['1', 1],
    ['100', 100],
    ['150', 100],
    ['999999', 100],
    ['0', 1],
    ['-5', 1],
    [' 42 ', 42],
    ['12.7', 12],
  ])('recorta %j a %d', (raw, expected) => {
    expect(clampMax(raw)).toBe(expected)
  })

  it.each(['', '   ', 'abc', '-'])('devuelve null para %j (campo vacío)', (raw) => {
    expect(clampMax(raw)).toBeNull()
  })
})

describe('opciones por defecto', () => {
  const now = new Date(2026, 9, 10)

  it('arrancan con los valores del diseño', () => {
    expect(createDefaultOptions({ now })).toEqual({
      repo: null,
      source: 'ambos',
      author: null,
      from: '2026-10-03',
      to: '2026-10-10',
      max: 30,
      tone: 'gracioso',
      format: 'podcast',
      duration: 60,
      language: 'es',
    })
  })

  it('el idioma del podcast puede venir de la interfaz', () => {
    expect(createDefaultOptions({ now, language: 'en' }).language).toBe('en')
  })

  it('daysAgo cruza meses', () => {
    expect(daysAgo(30, now)).toBe('2026-09-10')
  })
})

describe('toRequest', () => {
  it('devuelve null sin repo', () => {
    expect(toRequest(createDefaultOptions())).toBeNull()
  })

  it('usa el máximo por defecto si el campo quedó vacío', () => {
    const request = toRequest({ ...createDefaultOptions(), repo: 'a/b', max: null })
    expect(request?.max).toBe(30)
    expect(request?.repo).toBe('a/b')
  })
})

describe('describeRequest', () => {
  it('arma la línea de resumen', () => {
    const request = toRequest({
      ...createDefaultOptions(),
      repo: 'a/b',
      format: 'futbol',
      language: 'en',
    })
    if (!request) throw new Error('request nulo')
    expect(describeRequest(request, i18n.getFixedT('es'))).toBe(
      'Gracioso · Relato de fútbol · 1 min · Inglés',
    )
    expect(describeRequest(request, i18n.getFixedT('en'))).toBe(
      'Funny · Football commentary · 1 min · English',
    )
  })
})

describe('pickRandom', () => {
  it('nunca se sale de la lista', () => {
    expect(pickRandom(TONES, () => 0)).toBe('serio')
    expect(pickRandom(TONES, () => 0.9999)).toBe('roast')
    expect(pickRandom(TONES, () => 1)).toBe('roast')
  })
})
