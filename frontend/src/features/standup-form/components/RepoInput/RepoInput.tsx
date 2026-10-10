import { useId, type Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '@/lib/cx'
import form from '@/styles/form.module.css'
import styles from './RepoInput.module.css'

interface RepoInputProps {
  value: string
  onChange: (value: string) => void
  /** Se muestra debajo del campo cuando el formato no es válido. */
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
}

/** Campo de texto para el repositorio: `owner/nombre` o la URL de GitHub. */
export function RepoInput({ value, onChange, invalid = false, ref }: RepoInputProps) {
  const { t } = useTranslation()
  const inputId = useId()
  const hintId = useId()

  return (
    <div className={form.field}>
      <label htmlFor={inputId} className={form.label}>
        {t('source.repo.label')}
      </label>
      <input
        ref={ref}
        id={inputId}
        type="text"
        inputMode="url"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className={cx(styles.input, invalid && styles.invalid)}
        placeholder={t('source.repo.placeholder')}
        value={value}
        aria-invalid={invalid}
        aria-describedby={hintId}
        onChange={(event) => onChange(event.target.value)}
      />
      <span id={hintId} className={cx(styles.hint, invalid && styles.hintError)}>
        {invalid ? t('source.repo.invalid') : t('source.repo.hint')}
      </span>
    </div>
  )
}
