import styles from './SwipeDots.module.css'

// Mirrors the Figma component set `swipeDots` (15813:37248), whose variant is
// `active=1|2|3`. Expressed here as numbers rather than a string union: the batch size
// is however many quizzes are due, and hardcoding three would be the same
// fixed-count-that-lies problem the drill's ladder had.

export type SwipeDotsProps = {
  /** Which card is showing, 1-based. Figma's `active` variant. */
  active: number
  /** How many cards are in the batch. Figma only builds 3; this is not capped. */
  total: number
  className?: string
}

export function SwipeDots({ active, total, className }: SwipeDotsProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label={`Due quiz ${active} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={styles.dot} data-active={i + 1 === active} role="presentation" />
      ))}
    </div>
  )
}
