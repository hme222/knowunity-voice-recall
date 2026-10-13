import styles from './SessionFraction.module.css'

// The session fraction, e.g. History: docs/code-history.md#h-121

export type SessionFractionProps = {
  /** The term the student is on, 1-based. Omit when `label` names the round instead. */
  current?: number
  /** Terms in the session. 3–5 by the rule; the prototype runs 4. */
  total?: number
  /**
   * Replaces the fraction outright, for a stretch that is not one of the numbered
   * terms — the requeue rounds, which sit outside the numbering by decision.
   */
  label?: string
  /**
   * Suppresses "last one" on the final numbered term. Requeued terms come after it, so
   * on a run with anything owed a revisit, "4/4 · last one" is followed by two more
   * screens — it announced an ending that had not arrived.
   */
  moreToCome?: boolean
  className?: string
}

export function SessionFraction({ current, total, label, moreToCome, className }: SessionFractionProps) {
  const text =
    label ??
    (current != null && total != null
      ? // Said one screen early, so the end is visible before it arrives.
        `${current}/${total}${current === total && !moreToCome ? ' \u00b7 last one' : ''}`
      : null)
  if (text == null) return null
  return (
    <p className={[styles.root, className].filter(Boolean).join(' ')} aria-hidden="true">
      <span className={styles.pill}>{text}</span>
    </p>
  )
}
