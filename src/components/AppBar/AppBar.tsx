import type { ReactNode } from 'react'
import { ArrowLeftIcon, SquareIcon } from '../icons'
import styles from './AppBar.module.css'

// Mirrors the Figma component set `appBar` (9003:8606): a "Top Nav Default" frame
// holding one Slot, six variants for what sits around it. The left/right controls are
// the library's "App Bar Button Icon" (48 hit area, 40 pill, 24 icon) and "App Bar
// Button" (text, Headline XXS Bold), built inline here.

export const APP_BAR_VARIANTS = [
  'default',
  'leftIconButtonOnly',
  'leftAndRightIconButton',
  'leftAndRightButton',
  'leftAndTwoRightIconButtons',
  'leftAnd2RightButtons',
] as const
export type AppBarVariant = (typeof APP_BAR_VARIANTS)[number]

export type AppBarProps = {
  /** Figma `variant`. */
  variant?: AppBarVariant
  /** Figma `Slot`: whatever sits in the centre, e.g. a ProgressIndicator or a title. */
  children?: ReactNode
  /** Left icon button. Defaults to the back arrow. */
  leftIcon?: ReactNode
  leftLabel?: string
  onLeft?: () => void
  /** Right icon button(s), for the *IconButton* variants. */
  rightIcon?: ReactNode
  rightLabel?: string
  onRight?: () => void
  secondRightIcon?: ReactNode
  secondRightLabel?: string
  onSecondRight?: () => void
  /** Right text button, for the *Button variants. Figma samples "Skip". */
  rightText?: string
  onRightText?: () => void
  className?: string
}

function IconButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button type="button" className={styles.iconButton} aria-label={label} onClick={onClick}>
      <span className={styles.iconPill}>
        <span className={styles.icon}>{icon}</span>
      </span>
    </button>
  )
}

export function AppBar({
  variant = 'default',
  children,
  leftIcon,
  leftLabel = 'Back',
  onLeft,
  rightIcon,
  rightLabel = 'More',
  onRight,
  secondRightIcon,
  secondRightLabel = 'Options',
  onSecondRight,
  rightText = 'Skip',
  onRightText,
  className,
}: AppBarProps) {
  const hasLeft = variant !== 'default'
  const rightIconButton = variant === 'leftAndRightIconButton' || variant === 'leftAndTwoRightIconButtons' || variant === 'leftAnd2RightButtons'
  const secondRightIconButton = variant === 'leftAndTwoRightIconButtons'
  const rightTextButton = variant === 'leftAndRightButton' || variant === 'leftAnd2RightButtons'

  return (
    <header className={[styles.root, className].filter(Boolean).join(' ')} data-variant={variant}>
      <div className={styles.bar}>
        {hasLeft && <IconButton icon={leftIcon ?? <ArrowLeftIcon />} label={leftLabel} onClick={onLeft} />}
        <div className={styles.slot}>{children}</div>
        {(rightIconButton || rightTextButton) && (
          <div className={styles.right}>
            {rightIconButton && <IconButton icon={rightIcon ?? <SquareIcon />} label={rightLabel} onClick={onRight} />}
            {secondRightIconButton && <IconButton icon={secondRightIcon ?? <SquareIcon />} label={secondRightLabel} onClick={onSecondRight} />}
            {rightTextButton && (
              <button type="button" className={styles.textButton} onClick={onRightText}>
                {rightText}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
