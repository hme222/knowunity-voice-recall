import styles from './SessionFraction.module.css'

// The session fraction, e.g. "1/4". In Figma this is a loose text node in the
// scaffold's topNavigation slot, centred under the progress ring — not part of appBar.
// It is deliberately NOT bundled with appBar into a SessionHeader: 07 Recap has an
// app bar and no fraction, and a component that forced one would change that screen's
// design to suit the component. See SPEC.md § Conventions.
//
// The ring beside it carries the same information visually; this is its text
// equivalent, so it is aria-hidden and ProgressIndicator's own label does the
// announcing. Two announcements of one fact is noise.
//
// TWO THINGS IT NOW SAYS THAT IT DID NOT (2026-09-21). A student could not tell how
// far off the end was:
//   1. On the last term it says so. "4/4" alone does not read as "this is the last
//      one" until it is already over.
//   2. The requeue is a named round, not a term number. The frames drew 06 Lock It In
//      as 3/4 at 75%, which ran the bar 100% -> 75% -> 100% and made the session look
//      like it had gone backwards.

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
  className?: string
}

export function SessionFraction({ current, total, label, className }: SessionFractionProps) {
  const text =
    label ??
    (current != null && total != null
      ? // Said one screen early, so the end is visible before it arrives.
        `${current}/${total}${current === total ? ' \u00b7 last one' : ''}`
      : null)
  if (text == null) return null
  return (
    <p className={[styles.root, className].filter(Boolean).join(' ')} aria-hidden="true">
      {text}
    </p>
  )
}
