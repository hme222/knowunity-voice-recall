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

export type SessionFractionProps = {
  /** The term the student is on, 1-based. */
  current: number
  /** Terms in the session. 3–5 by the rule; the prototype runs 4. */
  total: number
  className?: string
}

export function SessionFraction({ current, total, className }: SessionFractionProps) {
  return (
    <p className={[styles.root, className].filter(Boolean).join(' ')} aria-hidden="true">
      {current}/{total}
    </p>
  )
}
