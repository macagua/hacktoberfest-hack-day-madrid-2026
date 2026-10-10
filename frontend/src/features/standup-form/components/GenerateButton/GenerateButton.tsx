import { useTranslation } from 'react-i18next'
import styles from './GenerateButton.module.css'
import { BroadcastIcon } from '@/components/icons'

interface GenerateButtonProps {
  onClick: () => void
}

export function GenerateButton({ onClick }: GenerateButtonProps) {
  const { t } = useTranslation()
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      <BroadcastIcon />
      <span>{t('generate')}</span>
    </button>
  )
}
