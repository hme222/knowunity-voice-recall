import styles from './MascotSlot.module.css'

// Mirrors the Figma component set `mascotSlot` (9003:8873): wraps a mascot pose at one of four sizes.

export const MASCOT_SLOT_SIZES = ['XL', '2XL', '3XL', '4XL'] as const
export const KNOWIE_EXPRESSIONS = ['dazed', 'determined', 'excited', 'laughing'] as const

export type MascotSlotProps = {
  /** Figma `size`: illustration.800 / 1500 / 2500 / 4000. */
  size?: (typeof MASCOT_SLOT_SIZES)[number]
  /** Which Knowie expression from public/knowie/ to show. The slot sets size, not expression. */
  expression?: (typeof KNOWIE_EXPRESSIONS)[number]
  className?: string
}

export function MascotSlot({ size = 'XL', expression = 'determined', className }: MascotSlotProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-size={size}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from public/, no optimisation needed */}
      <img className={styles.pose} src={`/knowie/${expression}.svg`} /* Decorative. The state is carried by the title a screen reader reaches next;
         announcing the internal prop name before every card is noise. */
      alt="" />
    </div>
  )
}
