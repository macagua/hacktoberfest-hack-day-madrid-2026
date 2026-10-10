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
    expect(createDefaultOptions({ now, repo: 'acme/demo' })).toEqual({
      repo: 'acme/demo',
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
  it('devuelve null si el repo no tiene formato válido', () => {
    expect(toRequest({ ...createDefaultOptions(), repo: '' })).toBeNull()
    expect(toRequest({ ...createDefaultOptions(), repo: 'solo-un-nombre' })).toBeNull()
  })

  it('normaliza la URL de GitHub a owner/nombre', () => {
    const request = toRequest({ ...createDefaultOptions(), repo: 'https://github.com/acme/demo' })
    expect(request?.repo).toBe('acme/demo')
  })

  it('manda solo lo que soporta el backend, con el máximo por defecto si quedó vacío', () => {
    const request = toRequest({ ...createDefaultOptions(), repo: 'a/b', max: null, language: 'en' })
    expect(request).toEqual({ repo: 'a/b', language: 'en', maxPrs: 30 })
  })
})

describe('describeRequest', () => {
  it('arma la línea de resumen en el idioma de la interfaz', () => {
    expect(describeRequest({ repo: 'a/b', language: 'en', maxPrs: 30 }, i18n.getFixedT('es'))).toBe(
      'Inglés · hasta 30 PRs',
    )
    expect(describeRequest({ repo: 'a/b', language: 'es', maxPrs: 1 }, i18n.getFixedT('en'))).toBe(
      'Spanish · up to 1 PR',
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
