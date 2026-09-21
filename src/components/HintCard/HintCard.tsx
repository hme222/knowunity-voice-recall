import styles from './HintCard.module.css'

// Mirrors the Figma component `hintCard` (15651:10676). No variants, no properties.

export type HintCardProps = {
  /** The one body line. */
  body: string
  /**
   * The label above the body. Defaults to "Hint", which is what the core loop's frames
   * show. The drill's DD 07 frame labels the same card "The missing word", because
   * there it is not a hint towards an answer — it IS the answer, handed over.
   */
  label?: string
  /** Tints the label. `missingWord` is the drill's coral; the default is tertiary. */
  tone?: 'default' | 'missingWord'
  className?: string
}

export function HintCard({ body, label = 'Hint', tone = 'default', className }: HintCardProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-tone={tone}>
      <p className={styles.label}>{label}</p>
      <p className={styles.body}>{body}</p>
    </div>
  )
}
