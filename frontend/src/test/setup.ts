import '@testing-library/jest-dom/vitest'
import i18n from '@/i18n'

// Los tests se escriben contra los textos en español, sin depender del idioma de la máquina.
await i18n.changeLanguage('es')

beforeEach(async () => {
  if (i18n.resolvedLanguage !== 'es') await i18n.changeLanguage('es')
})

// jsdom no implementa la reproducción de medios.
HTMLMediaElement.prototype.play = () => Promise.resolve()
HTMLMediaElement.prototype.pause = () => {}
