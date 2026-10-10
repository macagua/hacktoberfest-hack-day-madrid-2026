import { useTranslation } from 'react-i18next'
import { currentUiLanguage, UI_LANGUAGES } from '@/i18n'
import { cx } from '@/lib/cx'
import styles from './LanguageSwitcher.module.css'

/** Cambia el idioma de la interfaz (no el del podcast). La elección se recuerda en el navegador. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const active = currentUiLanguage()

  return (
    <div className={styles.switcher} role="group" aria-label={t('uiLanguage.label')}>
      {UI_LANGUAGES.map((language) => {
        const on = language === active
        return (
          <button
            key={language}
            type="button"
            lang={language}
            className={cx(styles.option, on && styles.on)}
            aria-pressed={on}
            aria-label={t(`uiLanguage.${language}Name`)}
            onClick={() => void i18n.changeLanguage(language)}
          >
            {t(`uiLanguage.${language}`)}
          </button>
        )
      })}
    </div>
  )
}
