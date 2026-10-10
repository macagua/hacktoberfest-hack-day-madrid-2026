import { useTranslation } from 'react-i18next'
import { useEffect, useId, useRef, useState } from 'react'
import type { TFunction } from 'i18next'
import type { ReposState } from '../../hooks/useGitHub'
import { cx } from '@/lib/cx'
import form from '@/styles/form.module.css'
import { ChevronIcon } from '@/components/icons'
import styles from './RepoSelect.module.css'

interface RepoSelectProps {
  connected: boolean
  repos: ReposState
  selected: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (repo: string) => void
  onConnect: () => void
}

function statusLabel(
  t: TFunction,
  connected: boolean,
  repos: ReposState,
  selected: string | null,
): string {
  if (!connected) return t('source.repo.connectFirst')
  if (repos.status === 'cargando') return t('source.repo.loading')
  if (repos.status === 'error') return t('source.repo.failed')
  return selected ?? t('source.repo.none')
}

export function RepoSelect({
  connected,
  repos,
  selected,
  open,
  onOpenChange,
  onSelect,
  onConnect,
}: RepoSelectProps) {
  const { t } = useTranslation()
  const labelId = useId()
  const listId = useId()
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const isOpen = open && connected

  useEffect(() => {
    if (!isOpen) return
    searchRef.current?.focus()

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        onOpenChange(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onOpenChange])

  const all = repos.status === 'listo' ? repos.repos : []
  const needle = query.trim().toLowerCase()
  const filtered = all.filter((repo) => repo.fullName.toLowerCase().includes(needle))

  function close() {
    setQuery('')
    onOpenChange(false)
  }

  function handleToggle() {
    if (!connected) {
      onConnect()
      return
    }
    if (isOpen) {
      close()
    } else {
      setQuery('')
      onOpenChange(true)
    }
  }

  return (
    <div className={cx(form.field, styles.root)} ref={rootRef}>
      <span id={labelId} className={form.label}>
        {t('source.repo.label')}
      </span>
      <button
        type="button"
        className={styles.trigger}
        aria-labelledby={labelId}
        aria-describedby={`${labelId}-value`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        onClick={handleToggle}
      >
        <span id={`${labelId}-value`} className={styles.value}>
          {statusLabel(t, connected, repos, selected)}
        </span>
        <ChevronIcon />
      </button>

      {isOpen && (
        <div className={styles.popover} id={listId}>
          <input
            ref={searchRef}
            type="search"
            className={styles.search}
            aria-label={t('source.repo.search')}
            placeholder={t('source.repo.searchPlaceholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {filtered.map((repo) => (
            <button
              key={repo.fullName}
              type="button"
              className={cx(styles.option, repo.fullName === selected && styles.optionSelected)}
              aria-pressed={repo.fullName === selected}
              onClick={() => {
                onSelect(repo.fullName)
                close()
              }}
            >
              {repo.fullName}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className={styles.empty}>
              {repos.status === 'listo'
                ? t('source.repo.noMatch')
                : statusLabel(t, connected, repos, selected)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
