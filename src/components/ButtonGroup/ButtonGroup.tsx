import type { ReactNode } from 'react'
import styles from './ButtonGroup.module.css'

// Mirrors the Figma component set `buttonGroup` (9003:8455): two button / buttonIcon
// instances, Horizontal or Vertical, M or L. Children are the two instances; pass
// `fullWidth` on the ones Figma sets to "Fill container" (both in Vertical, the
// text button in Horizontal).

export const BUTTON_GROUP_VARIANTS = ['Horizontal', 'Vertical'] as const
export const BUTTON_GROUP_SIZES = ['M', 'L'] as const

export type ButtonGroupProps = {
  /** Figma `variant`. */
  variant?: (typeof BUTTON_GROUP_VARIANTS)[number]
  /** Figma `size`. Must match the size of the two buttons inside. */
  size?: (typeof BUTTON_GROUP_SIZES)[number]
  /** Exactly two: Button and/or ButtonIcon. */
  children: ReactNode
  className?: string
}

export function ButtonGroup({ variant = 'Vertical', size = 'M', children, className }: ButtonGroupProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-variant={variant} data-size={size} role="group">
      {children}
    </div>
  )
}
