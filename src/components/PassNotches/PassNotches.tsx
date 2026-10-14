import styles from './PassNotches.module.css'

// The Pass card's strength notches (designer, 2026-10-14, option B of four mocked):
// one notch per unaided pass on this term, five to full, never dropping. Not the
// StrengthMeter — that is the drill's continuous coverage bar, and sprint-context
// records it as "not a segment counter", so the two meanings never share a component.

/** component.passNotches.count */
export const PASS_NOTCHES = 5

export type PassNotchesProps = {
  /** Unaided passes on this term so far, today's included. Clamped to 0–PASS_NOTCHES. */
  filled: number
  /** Today's pass added the last filled notch: it is ringed and brightest. */
  fresh?: boolean
  className?: string
}

export function PassNotches({ filled, fresh = false, className }: PassNotchesProps) {
  const n = Math.max(0, Math.min(PASS_NOTCHES, Math.round(filled)))
  const spoken = `Strength: ${n} of ${PASS_NOTCHES} unaided${fresh && n > 0 ? ', one more today' : ''}`
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <span className={styles.label} aria-hidden="true">
        Strength
      </span>
      <span className={styles.notches} role="img" aria-label={spoken}>
        {Array.from({ length: PASS_NOTCHES }, (_, i) => (
          <i key={i} className={styles.notch} data-state={i < n ? (fresh && i === n - 1 ? 'fresh' : 'filled') : 'empty'} />
        ))}
      </span>
    </div>
  )
}
