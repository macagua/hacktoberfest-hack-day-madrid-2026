import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { es } from './locales/es'

export const UI_LANGUAGES = ['es', 'en'] as const
export type UiLanguage = (typeof UI_LANGUAGES)[number]
export const DEFAULT_UI_LANGUAGE: UiLanguage = 'es'

export const resources = {
  es: { translation: es },
  en: { translation: en },
} as const

export function isUiLanguage(value: string | undefined): value is UiLanguage {
  return UI_LANGUAGES.some((language) => language === value)
}

/** Idioma actual de la interfaz, normalizado a uno soportado. */
export function currentUiLanguage(): UiLanguage {
  const language = i18n.resolvedLanguage
  return isUiLanguage(language) ? language : DEFAULT_UI_LANGUAGE
}

// Mantiene `<html lang>` y la descripción en sintonía con el idioma elegido.
i18n.on('languageChanged', () => {
  if (typeof document === 'undefined') return
  document.documentElement.lang = currentUiLanguage()
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', i18n.t('meta.description'))
})

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_UI_LANGUAGE,
    supportedLngs: UI_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: { escapeValue: false }, // React ya escapa
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'standup-fm.lang',
      caches: ['localStorage'],
    },
  })

export default i18n
