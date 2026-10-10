import 'i18next'
import type { es } from './locales/es'

// Claves tipadas: `t('header.conect')` (con typo) no compila.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof es }
  }
}
