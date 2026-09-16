import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoadingIcon, PlusIcon, SquareIcon } from '../icons'
import styles from './ButtonIcon.module.css'

// Mirrors the Figma component set `buttonIcon` (9003:8235). Same variant/size/state
// axes as button plus Overlay; a single centred iconSlot, no text layer.

export const BUTTON_ICON_VARIANTS = ['Primary', 'Secondary', 'Tertiary', 'Overlay'] as const
export const BUTTON_ICON_SIZES = ['S', 'M', 'L'] as const
export const BUTTON_ICON_STATES = ['Default', 'Pressed', 'Disabled', 'Loading'] as const

export type ButtonIconVariant = (typeof BUTTON_ICON_VARIANTS)[number]
export type ButtonIconSize = (typeof BUTTON_ICON_SIZES)[number]
export type ButtonIconState = (typeof BUTTON_ICON_STATES)[number]

export type ButtonIconProps = {
  /** Accessible name. There is no text layer, so this is required. */
  label: string
  /** Figma `variant`. Overlay exists in Figma only at S / Default. */
  variant?: ButtonIconVariant
  /** Figma `size`. */
  size?: ButtonIconSize
  /** Figma `state`. Default also shows Pressed while the finger is down. */
  state?: ButtonIconState
  /** The icon. Falls back to Figma's `square` placeholder (plusSign on Overlay). */
  icon?: ReactNode
  /** Figma sizing override "Fill container", as used inside buttonGroup. Not a Figma property. */
  fullWidth?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled' | 'aria-label'>

export function ButtonIcon({
  label,
  variant = 'Primary',
  size = 'S',
  state = 'Default',
  icon,
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: ButtonIconProps) {
  const loading = state === 'Loading'
  const inert = loading || state === 'Disabled'
  const fallback = variant === 'Overlay' ? <PlusIcon /> : <SquareIcon />

  return (
    <button
      {...rest}
      type={type}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      data-state={state}
      data-full-width={fullWidth || undefined}
      disabled={inert}
      aria-busy={loading || undefined}
      aria-label={label}
    >
      <span className={styles.pill}>
        <span className={styles.content}>
          <span className={styles.icon}>{loading ? <LoadingIcon className={styles.spinner} /> : (icon ?? fallback)}</span>
        </span>
      </span>
    </button>
  )
}
