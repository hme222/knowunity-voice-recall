import styles from './MascotSlot.module.css'

// Mirrors the Figma component set `mascotSlot` (9003:8873): wraps a mascot pose at one of four sizes.

export const MASCOT_SLOT_SIZES = ['XL', '2XL', '3XL', '4XL'] as const
// All fourteen faces of the Figma Knowie set (🎨 Mascot & components → Knowie, 9003:19697),
// exported 2026-10-13 (designer: "I see 14 different Knowies on Figma"). None are drawn.
export const KNOWIE_EXPRESSIONS = [
  'standby', 'confused', 'approving', 'over-it', 'laughing', 'angry', 'amazed',
  'dazed', 'excited', 'giggling', 'questioning', 'thinking', 'sad', 'determined',
] as const

export type MascotSlotProps = {
  /** Figma `size`: illustration.800 / 1500 / 2500 / 4000. */
  size?: (typeof MASCOT_SLOT_SIZES)[number]
  /** Which Knowie expression from public/knowie/ to show. The slot sets size, not expression. */
  expression?: (typeof KNOWIE_EXPRESSIONS)[number]
  className?: string
}

export function MascotSlot({ size = 'XL', expression = 'determined', className }: MascotSlotProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-size={size} data-mascot>
      {/* Intrinsic size (the Figma pose's 200x217), so the box is reserved before the
          SVG loads and nothing shifts; CSS still sizes it to the slot. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from public/, no optimisation needed */}
      <img className={styles.pose} width={200} height={217} src={`/knowie/${expression}.svg`} /* Decorative. The state is carried by the title a screen reader reaches next;
         announcing the internal prop name before every card is noise. */
      alt="" />
    </div>
  )
}
