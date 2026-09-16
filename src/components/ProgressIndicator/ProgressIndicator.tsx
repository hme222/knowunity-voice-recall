import styles from './ProgressIndicator.module.css'

// Mirrors the Figma component set `progressIndicator` (9003:8923).

export const PROGRESS_VARIANTS = ['Primary', 'Coral'] as const
export const PROGRESS_THICKNESSES = ['24', '16'] as const
export const PROGRESS_STEPS = ['0', '25', '50', '75', '100'] as const

export type ProgressIndicatorProps = {
  /** Figma `variant`. */
  variant?: (typeof PROGRESS_VARIANTS)[number]
  /** Figma `thickness`, in px, as Figma names it. */
  thickness?: (typeof PROGRESS_THICKNESSES)[number]
  /** Figma `progress`: fixed 25% steps, not a continuous range. */
  progress?: (typeof PROGRESS_STEPS)[number]
  /** Figma `showText` (default false): the current/total label. */
  showText?: boolean
  /** Numbers for the label, e.g. current 6 of total 12. */
  current?: number
  total?: number
  className?: string
}

export function ProgressIndicator({
  variant = 'Primary',
  thickness = '24',
  progress = '0',
  showText = false,
  current,
  total,
  className,
}: ProgressIndicatorProps) {
  const label = current !== undefined && total !== undefined ? `${current}/${total}` : undefined
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-thickness={thickness}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Number(progress)}
      aria-valuetext={label}
    >
      <div className={styles.container}>
        <div className={styles.bar} style={{ width: `${progress}%` }} />
      </div>
      {showText && label && <span className={styles.text}>{label}</span>}
    </div>
  )
}
