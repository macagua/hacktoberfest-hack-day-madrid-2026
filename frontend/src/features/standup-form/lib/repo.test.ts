import { describe, expect, it } from 'vitest'
import { normalizeRepo } from './repo'

describe('normalizeRepo', () => {
  it.each([
    ['macagua/hacktoberfest-hack-day-madrid-2026', 'macagua/hacktoberfest-hack-day-madrid-2026'],
    ['  acme/demo  ', 'acme/demo'],
    ['https://github.com/acme/demo', 'acme/demo'],
    ['https://github.com/acme/demo/', 'acme/demo'],
    ['http://www.github.com/acme/demo.git', 'acme/demo'],
    ['acme/my.repo_v2', 'acme/my.repo_v2'],
  ])('%j → %j', (raw, expected) => {
    expect(normalizeRepo(raw)).toBe(expected)
  })

  it.each([
    '',
    'acme',
    'acme/',
    '/demo',
    'acme/demo/extra',
    'https://gitlab.com/acme/demo',
    'a b/c',
  ])('rechaza %j', (raw) => {
    expect(normalizeRepo(raw)).toBeNull()
  })
})
