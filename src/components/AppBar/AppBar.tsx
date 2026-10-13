import type { ReactNode } from 'react'
import { ArrowLeftIcon, SquareIcon } from '../icons'
import { Button } from '../Button/Button'
import { ButtonIcon } from '../ButtonIcon/ButtonIcon'
import styles from './AppBar.module.css'

// Mirrors the Figma component set `appBar` (9003:8606): a "Top Nav Default" frame holding one Slot, six variants for what sits around it. History: docs/code-history.md#h-098

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

/** App Bar Button Icon = ButtonIcon Tertiary L: 48 hit area, 24 icon, no fill. */
function IconButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return <ButtonIcon variant="Tertiary" size="L" icon={icon} label={label} onClick={onClick} />
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
              // App Bar Button = Button Tertiary M, with the frame's space.300 lead-in.
              <Button variant="Tertiary" size="M" CTA={rightText} onClick={onRightText} className={styles.textButton} />
            )}
          </div>
        )}
      </div>
    </header>
  )
}
