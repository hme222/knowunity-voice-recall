import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoadingIcon } from './LoadingIcon'
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
  /** Content for the left icon slot when showLeftIcon is on. Falls back to Figma's empty-square placeholder. */
  leftIcon?: ReactNode
  /** Content for the right icon slot when showRightIcon is on. Falls back to Figma's empty-square placeholder. */
  rightIcon?: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'>

const Placeholder = () => <span className={styles.placeholder} aria-hidden="true" />

export function Button({
  CTA,
  variant = 'Primary',
  size = 'S',
  state = 'Default',
  showLeftIcon = false,
  showRightIcon = false,
  leftIcon,
  rightIcon,
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
      disabled={inert}
      aria-busy={loading || undefined}
      aria-label={loading ? CTA : undefined}
    >
      <span className={styles.pill}>
        {loading ? (
          // Loading removes the label and shows the spinner in the centre icon container.
          <span className={styles.icon}>
            <LoadingIcon className={styles.spinner} />
          </span>
        ) : (
          <>
            {showLeftIcon && <span className={styles.icon}>{leftIcon ?? <Placeholder />}</span>}
            <span className={styles.label}>{CTA}</span>
            {showRightIcon && <span className={styles.icon}>{rightIcon ?? <Placeholder />}</span>}
          </>
        )}
      </span>
    </button>
  )
}
