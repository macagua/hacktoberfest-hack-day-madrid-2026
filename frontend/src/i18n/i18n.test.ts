import { describe, expect, it } from 'vitest'
import { en } from './locales/en'
import { es } from './locales/es'

type Tree = { [key: string]: string | readonly string[] | Tree }

function keysOf(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'string' || Array.isArray(value) ? [path] : keysOf(value as Tree, path)
  })
}

describe('traducciones', () => {
  it('inglés y español tienen exactamente las mismas claves', () => {
    expect(keysOf(en).sort()).toEqual(keysOf(es).sort())
  })

  it('las listas tienen la misma cantidad de elementos', () => {
    expect(en.result.loading.messages).toHaveLength(es.result.loading.messages.length)
  })

  it('ningún texto quedó vacío', () => {
    const empty = [es, en].flatMap((tree) =>
      keysOf(tree).filter((path) => {
        const value = path.split('.').reduce<unknown>((node, key) => (node as Tree)[key], tree)
        return value === '' || (Array.isArray(value) && value.some((item) => item === ''))
      }),
    )
    expect(empty).toEqual([])
  })
})
