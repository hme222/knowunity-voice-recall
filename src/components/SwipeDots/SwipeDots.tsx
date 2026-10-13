import styles from './SwipeDots.module.css'

// Mirrors the Figma component set `swipeDots` (15813:37248), whose variant is `active=1|2|3`. History: docs/code-history.md#h-129

export type SwipeDotsProps = {
  /** Which card is showing, 1-based. Figma's `active` variant. */
  active: number
  /** How many cards are in the batch. Figma only builds 3; this is not capped. */
  total: number
  /**
   * Jump to a card, 1-based. Supplying it makes the dots interactive; leaving it out
   * keeps them decorative.
   */
  onSelect?: (oneBased: number) => void
  /** Names what is being paged, e.g. "Due quiz". */
  label?: string
  className?: string
}

export function SwipeDots({ active, total, onSelect, label = 'Due quiz', className }: SwipeDotsProps) {
  const groupLabel = `${label} ${active} of ${total}`

  if (!onSelect) {
    return (
      <div className={[styles.root, className].filter(Boolean).join(' ')} role="group" aria-label={groupLabel}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={styles.dot} data-active={i + 1 === active} role="presentation" />
        ))}
      </div>
    )
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} role="tablist" aria-label={groupLabel}>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i + 1 === active}
          aria-label={`${label} ${i + 1} of ${total}`}
          className={styles.target}
          onClick={() => onSelect(i + 1)}
        >
          {/* The dot stays the size Figma draws it; the tap target around it is the one
              that has to clear 44pt, so the hit area grows and the paint does not. */}
          <span className={styles.dot} data-active={i + 1 === active} />
        </button>
      ))}
    </div>
  )
}
