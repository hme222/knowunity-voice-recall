import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { RetryIcon, SquareIcon } from '../icons'
import styles from './Chips.module.css'

// Mirrors the Figma component set `chips` (9003:8679). Props carry the Figma names.

export const CHIPS_SIZES = ['XXS', 'XS', 'S', 'M'] as const
export const CHIPS_COLORS = ['Primary', 'pro', 'Coral', 'Partial'] as const

export type ChipsProps = {
  /** Figma `Text`. */
  Text: string
  /** Figma `size`. */
  size?: (typeof CHIPS_SIZES)[number]
  /**
   * Figma `color`. Coral is the retry affordance and nothing else: it binds to
   * feedback.unclear, which exists to keep a system mishear separate from a wrong
   * answer. A partially-correct verdict is `Partial`.
   */
  color?: (typeof CHIPS_COLORS)[number]
  /** Figma `active`. */
  active?: boolean
  /**
   * True only when the chip is a real toggle. A momentary action (retry, a filter that
   * navigates) is not one, and announcing it as "toggle button, pressed" describes
   * state that does not exist. Off by default: most chips here are one-shot.
   */
  toggle?: boolean
  /** Figma `showLeftIcon` (default true). */
  showLeftIcon?: boolean
  /** Figma `showRightIcon` (default true; false on Coral, as in Figma). */
  showRightIcon?: boolean
  /**
   * Left slot content; falls back to the `square` placeholder, or the retry arrow on
   * Coral. That fallback was `RefreshIcon`, an arc with no arrowhead — so the same
   * "Try again" chip had a headless circle here and a real arrow when RecallResult
   * passed one in. One glyph now, and it is the one with the arrow.
   */
  leftIcon?: ReactNode
  /** Right slot content; falls back to the `square` placeholder. */
  rightIcon?: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>

/**
 * Renders a <button> only when it does something. Used without onClick it is a status
 * label, and shipping those as focusable aria-pressed toggles put five inert chips in
 * the tab order announcing themselves as pressed buttons that do nothing.
 */
export function Chips({
  Text: text,
  size = 'XXS',
  color = 'Primary',
  active = false,
  toggle = false,
  showLeftIcon = true,
  showRightIcon = color !== 'Coral', // the one Coral cell in Figma has its right iconSlot hidden
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  ...rest
}: ChipsProps) {
  const interactive = rest.onClick != null
  const Tag = (interactive ? 'button' : 'span') as 'button'
  // A chip that does nothing is a LABEL, not a live region. It used to carry
  // role="status", which was the right instinct — stop announcing it as a button —
  // aimed at the wrong role: role="status" marks content that CHANGES and should
  // interrupt, and these never change. The cost showed up when one landed inside a
  // region that is genuinely live: 04a Couldn't hear puts the coral chip inside
  // RecallResult's own role="status", so "Try again" was announced as a second status
  // on top of the result it belongs to. No role: the text is read once, in order, as
  // part of the thing it labels.
  return (
    <Tag
      {...rest}
      {...(interactive ? { type } : {})}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-size={size}
      data-color={color}
      data-active={active || undefined}
      data-interactive={interactive || undefined}
      aria-pressed={interactive && toggle ? active : undefined}
    >
      {showLeftIcon && <span className={styles.icon}>{leftIcon ?? (color === 'Coral' ? <RetryIcon /> : <SquareIcon />)}</span>}
      <span className={styles.label}>{text}</span>
      {showRightIcon && <span className={styles.icon}>{rightIcon ?? <SquareIcon />}</span>}
    </Tag>
  )
}
