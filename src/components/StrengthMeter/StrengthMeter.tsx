import { useId } from 'react'
import styles from './StrengthMeter.module.css'

// Mirrors Figma's `strengthMeter` (15808:17668), but continuous rather than stepped.
//
// Figma's variants are fill=0|25|50|75|100 — a leftover from the fixed four-rung
// ladder. The drill has no fixed length: the meter fills by how much of the definition
// the student can say unaided, as coverage of the sentence, not by which pass they are
// on. A strong student finishes in two passes, a struggling one in six. So `fill` is a
// number here, and Figma's five values are sampled states of it.
//
// Two rules this depends on (docs/sprint-context.md § "Definition Drill Down"):
//   1. the judge must score unaided coverage per pass — unconfirmed with engineering
//   2. help holds the meter, never drops it: a reveal or a miss parks it rather than
//      reducing it. A student must never watch progress go backwards for asking.
//
// Colour is bound to the Figma component render, including its darkens-as-it-fills
// ramp. See the module CSS for why that was reverted to Figma on 2026-09-21.

export type StrengthMeterProps = {
  /** Coverage of the definition the student can say unaided, 0–100. */
  fill: number
  /** Optional caption under the track. */
  label?: string
  className?: string
}

// Figma's variants step at 0/25/50/75/100 and its 0 and 25 share a colour, so these
// are its four distinct fills expressed as ranges of a continuous value.
function band(fill: number) {
  if (fill >= 100) return 'full'
  if (fill >= 75) return 'high'
  if (fill >= 50) return 'mid'
  return 'low'
}

export function StrengthMeter({ fill, label, className }: StrengthMeterProps) {
  const clamped = Math.max(0, Math.min(100, fill))
  // The visible caption IS the bar's name. Naming the bar with the same string in
  // aria-label read it twice — once as the bar, once as text. Without a caption the
  // bar still needs a name, so the fallback stays as aria-label.
  const labelId = useId()
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : 'How much you can say unaided'}
      >
        <div className={styles.fill} style={{ width: `${clamped}%` }} data-band={band(clamped)} />
      </div>
      {label && (
        <p id={labelId} className={styles.label}>
          {label}
        </p>
      )}
    </div>
  )
}
