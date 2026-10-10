import { useTranslation } from 'react-i18next'
import { GitHubIcon } from '@/components/icons'
import type { Session } from '@/types'
import styles from './SessionButton.module.css'

interface SessionButtonProps {
  session: Session
  onConnect: () => void
  onDisconnect: () => void
}

function initials(login: string): string {
  const letters = login.replace(/[^a-z0-9]/gi, '').slice(0, 2)
  return letters.toUpperCase() || '?'
}

/** "Conectar con GitHub" o la píldora con el avatar del usuario conectado. */
export function SessionButton({ session, onConnect, onDisconnect }: SessionButtonProps) {
  const { t } = useTranslation()

  if (session.status === 'cargando') {
    return <span className={styles.placeholder} aria-hidden="true" />
  }

  if (session.status === 'desconectado') {
    return (
      <button type="button" className={styles.connect} onClick={onConnect}>
        <GitHubIcon />
        <span>{t('header.connect')}</span>
      </button>
    )
  }

  const { login, avatarUrl } = session.user
  return (
    <button
      type="button"
      className={styles.user}
      onClick={onDisconnect}
      aria-label={t('header.connectedAs', { login })}
    >
      <span className={styles.avatar} aria-hidden="true">
        {avatarUrl ? <img src={avatarUrl} alt="" /> : initials(login)}
      </span>
      <span>@{login}</span>
    </button>
  )
}
