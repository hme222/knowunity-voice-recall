import { useId } from 'react'
import styles from './StrengthMeter.module.css'

// Mirrors Figma's `strengthMeter` (15808:17668), but continuous rather than stepped. History: docs/code-history.md#h-123

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
