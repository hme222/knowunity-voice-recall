import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { RefreshIcon, SquareIcon } from '../icons'
import styles from './Chips.module.css'

// Mirrors the Figma component set `chips` (9003:8679). Props carry the Figma names.

export const CHIPS_SIZES = ['XXS', 'XS', 'S', 'M'] as const
export const CHIPS_COLORS = ['Primary', 'pro', 'Coral'] as const

export type ChipsProps = {
  /** Figma `Text`. */
  Text: string
  /** Figma `size`. */
  size?: (typeof CHIPS_SIZES)[number]
  /** Figma `color`. Coral exists in Figma only at S / active. */
  color?: (typeof CHIPS_COLORS)[number]
  /** Figma `active`. */
  active?: boolean
  /** Figma `showLeftIcon` (default true). */
  showLeftIcon?: boolean
  /** Figma `showRightIcon` (default true). */
  showRightIcon?: boolean
  /** Left slot content; falls back to the `square` placeholder (`refresh` on Coral). */
  leftIcon?: ReactNode
  /** Right slot content; falls back to the `square` placeholder. */
  rightIcon?: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>

export function Chips({
  Text: text,
  size = 'XXS',
  color = 'Primary',
  active = false,
  showLeftIcon = true,
  showRightIcon = true,
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  ...rest
}: ChipsProps) {
  return (
    <button
      {...rest}
      type={type}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-size={size}
      data-color={color}
      data-active={active || undefined}
      aria-pressed={active}
    >
      {showLeftIcon && <span className={styles.icon}>{leftIcon ?? (color === 'Coral' ? <RefreshIcon /> : <SquareIcon />)}</span>}
      <span className={styles.label}>{text}</span>
      {showRightIcon && <span className={styles.icon}>{rightIcon ?? <SquareIcon />}</span>}
    </button>
  )
}
