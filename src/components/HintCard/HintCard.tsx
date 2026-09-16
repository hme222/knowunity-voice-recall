import styles from './HintCard.module.css'

// Mirrors the Figma component `hintCard` (15651:10676). No variants, no properties.

export type HintCardProps = {
  /** The one body line. */
  body: string
  className?: string
}

export function HintCard({ body, className }: HintCardProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <p className={styles.label}>Hint</p>
      <p className={styles.body}>{body}</p>
    </div>
  )
}
