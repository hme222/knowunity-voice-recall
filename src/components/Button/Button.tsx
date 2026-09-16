import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoadingIcon } from '../icons'
import { SquareIcon } from '../icons'
import styles from './Button.module.css'

// Mirrors the Figma component set `button` (9003:6667) on "🎨 Mascot & components".
// Props carry the Figma variant and property names and options unchanged.

export const BUTTON_VARIANTS = ['Primary', 'Secondary', 'Tertiary'] as const
export const BUTTON_SIZES = ['S', 'M', 'L'] as const
export const BUTTON_STATES = ['Default', 'Pressed', 'Disabled', 'Loading'] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]
export type ButtonState = (typeof BUTTON_STATES)[number]

export type ButtonProps = {
  /** Figma `CTA`: the label. Sentence case. */
  CTA: string
  /** Figma `variant`. */
  variant?: ButtonVariant
  /** Figma `size`. */
  size?: ButtonSize
  /** Figma `state`. Default also shows Pressed while the finger is down. */
  state?: ButtonState
  /** Figma `showLeftIcon`. */
  showLeftIcon?: boolean
  /** Figma `showRightIcon`. */
  showRightIcon?: boolean
  /** Content for the left icon slot when showLeftIcon is on. Falls back to Figma's `square` placeholder. */
  leftIcon?: ReactNode
  /** Content for the right icon slot when showRightIcon is on. Falls back to Figma's `square` placeholder. */
  rightIcon?: ReactNode
  /** Figma sizing override "Fill container", as used inside buttonGroup. Not a Figma property. */
  fullWidth?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'>

export function Button({
  CTA,
  variant = 'Primary',
  size = 'S',
  state = 'Default',
  showLeftIcon = false,
  showRightIcon = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const loading = state === 'Loading'
  const inert = loading || state === 'Disabled'

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
    >
      <span className={styles.pill}>
        {loading ? (
          // Loading: the label layer stays but is hidden, the spinner takes the centre icon container.
          <>
            <span className={styles.icon}>
              <LoadingIcon className={styles.spinner} />
            </span>
            <span className={styles.hiddenLabel}>{CTA}</span>
          </>
        ) : (
          // Figma wraps icons + label in a frame with a small bottom padding, lifting them off centre.
          <span className={styles.content}>
            {showLeftIcon && <span className={styles.icon}>{leftIcon ?? <SquareIcon />}</span>}
            <span className={styles.label}>{CTA}</span>
            {showRightIcon && <span className={styles.icon}>{rightIcon ?? <SquareIcon />}</span>}
          </span>
        )}
      </span>
    </button>
  )
}
