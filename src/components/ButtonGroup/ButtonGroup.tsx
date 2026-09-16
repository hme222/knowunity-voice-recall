import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import styles from './ButtonGroup.module.css'

// Mirrors the Figma component set `buttonGroup` (9003:8455): two button / buttonIcon
// instances, Horizontal or Vertical, M or L. Figma's instance overrides set both to
// "Fill container" in Vertical, and only the second (the text button) in Horizontal;
// the group applies those itself, so callers pass plain Button / ButtonIcon children.

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
  // Accept the two children directly or inside a Fragment.
  const flat = Children.toArray(children).flatMap((c) =>
    isValidElement(c) && c.type === Fragment ? Children.toArray((c.props as { children?: ReactNode }).children) : [c],
  )
  const items = flat.map((child, i) => {
    const fill = variant === 'Vertical' || i === 1
    return isValidElement(child) && fill ? cloneElement(child as ReactElement<{ fullWidth?: boolean }>, { fullWidth: true }) : child
  })
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-variant={variant} data-size={size} role="group">
      {items}
    </div>
  )
}
