import { useTranslation } from 'react-i18next'
import { cx } from '@/lib/cx'
import type { PrioritizedPullRequest, PriorityLevel } from '@/types'
import styles from './PrList.module.css'

interface PrListProps {
  prs: PrioritizedPullRequest[]
  totalOpen: number
}

const LEVELS: readonly PriorityLevel[] = ['alta', 'media', 'baja']

const LEVEL_CLASS: Record<PriorityLevel, string | undefined> = {
  alta: styles.levelHigh,
  media: styles.levelMedium,
  baja: styles.levelLow,
}

function formatPoints(points: number): string {
  return points > 0 ? `+${points}` : String(points).replace('-', '−')
}

/** PRs abiertas ordenadas por prioridad, con su estado, siguiente paso y el porqué del puntaje. */
export function PrList({ prs, totalOpen }: PrListProps) {
  const { t } = useTranslation()
  const countByLevel = (level: PriorityLevel) => prs.filter((item) => item.level === level).length

  return (
    <section className={styles.section} aria-labelledby="sfm-prs">
      <div className={styles.header}>
        <h3 id="sfm-prs" className={styles.heading}>
          {t('result.prs.title')}
        </h3>
        <ul className={styles.totals}>
          <li>{t('result.prs.open', { count: totalOpen })}</li>
          {LEVELS.map((level) => (
            <li key={level} className={cx(styles.total, LEVEL_CLASS[level])}>
              {countByLevel(level)} {t(`result.prs.level.${level}`)}
            </li>
          ))}
        </ul>
      </div>

      <ol className={styles.list}>
        {prs.map(({ pr, score, level, status, nextAction, reasons }) => (
          <li key={pr.number} className={styles.item}>
            <div className={styles.badges}>
              <span className={cx(styles.level, LEVEL_CLASS[level])}>
                {t(`result.prs.level.${level}`)}
              </span>
              <span className={styles.score}>{t('result.prs.points', { count: score })}</span>
              <span className={styles.status}>{t(`result.prs.status.${status}`)}</span>
            </div>

            <a className={styles.title} href={pr.url} target="_blank" rel="noreferrer">
              <span className={styles.number}>#{pr.number}</span> {pr.title}
            </a>

            <div className={styles.meta}>
              <span>@{pr.author}</span>
              <span>{t('result.prs.age', { count: pr.ageDays })}</span>
              <span>{t('result.prs.idle', { count: pr.idleDays })}</span>
              {pr.additions !== null && pr.deletions !== null && (
                <span>
                  <span className={styles.added}>+{pr.additions}</span>{' '}
                  <span className={styles.removed}>−{pr.deletions}</span>
                </span>
              )}
              {pr.labels.map((label) => (
                <span key={label} className={styles.label}>
                  {label}
                </span>
              ))}
            </div>

            <p className={styles.next}>
              <span className={styles.nextLabel}>{t('result.prs.next')}</span> {nextAction}
            </p>

            {reasons.length > 0 && (
              <details className={styles.reasons}>
                <summary>{t('result.prs.why', { count: reasons.length })}</summary>
                <ul>
                  {reasons.map((reason) => (
                    <li key={reason.reason}>
                      <span
                        className={cx(styles.points, reason.points < 0 && styles.pointsNegative)}
                      >
                        {formatPoints(reason.points)}
                      </span>
                      {reason.reason}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
