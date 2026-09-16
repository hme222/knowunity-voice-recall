import styles from './TextBlock.module.css'

// Mirrors the Figma component set `textBlock` (9003:9039).

export const TEXT_BLOCK_VARIANTS = ['XL', 'L', 'M', 'S'] as const

export type TextBlockProps = {
  /** Figma `variant`. */
  variant?: (typeof TEXT_BLOCK_VARIANTS)[number]
  /** Figma `title`. */
  title: string
  /** Figma `caption`. */
  caption?: string
  /** Figma `showCaption` (default true). */
  showCaption?: boolean
  className?: string
}

export function TextBlock({ variant = 'XL', title, caption, showCaption = true, className }: TextBlockProps) {
  const Heading = variant === 'XL' || variant === 'L' ? 'h1' : 'h2'
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-variant={variant}>
      <Heading className={styles.header}>{title}</Heading>
      {showCaption && caption && <p className={styles.caption}>{caption}</p>}
    </div>
  )
}
