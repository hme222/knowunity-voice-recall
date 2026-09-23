import { useEffect, useRef, type ReactNode } from 'react'
import { ButtonIcon } from '../ButtonIcon/ButtonIcon'
import { CloseIcon } from '../icons'
import styles from './BottomSheet.module.css'

// Mirrors the Figma component `bottomSheet` (15813:37265). `Title` is its text property.
//
// THE RULE, not just the shape: a sheet lives on its own branch screen and must never
// be baked into a screen that represents a default state. That mistake has been made
// three times in the Figma file, and the scaffold's `showBottomSheetBackground`
// toggle is deliberately not reproduced in ScreenShell for the same reason.
//
// Content rows need `background.raised`: an optionRow inside a sheet resolves to the
// sheet's own fill and vanishes. PickerRow takes a `raised` prop for this.

export type BottomSheetProps = {
  /** Figma `Title`. */
  Title: string
  /** Optional line under the title. */
  subtitle?: string
  children: ReactNode
  /** Tapping the scrim. A sheet must always be dismissible. */
  onDismiss?: () => void
  className?: string
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function BottomSheet({ Title, subtitle, children, onDismiss, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // A dialog whose only dismissal was a click on a presentational scrim could not be
  // closed by keyboard at all. Escape and a labelled close control, both required.
  useEffect(() => {
    if (!onDismiss) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  // Focus moves INTO the sheet and stays there while it is open.
  //
  // `aria-modal="true"` says the rest of the page is inert; it does not make it so.
  // Nothing was removed from the tab order, so on /drill/complete/round four controls
  // behind the sheet stayed reachable — Tab walked straight out of an open dialog into
  // a screen the student cannot see, and focus never entered the sheet in the first
  // place, so a keyboard user was never told a dialog had opened.
  //
  // Trapped here rather than by inerting the page, because the sheet renders inside the
  // screen's own tree rather than through a portal: there is no reliable "everything
  // else" to mark. The trap is what the student experiences either way.
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    const returnTo = document.activeElement as HTMLElement | null

    const first = sheet.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? sheet).focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = [...sheet.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) {
        e.preventDefault()
        sheet.focus()
        return
      }
      const edge = e.shiftKey ? items[0] : items[items.length - 1]
      if (document.activeElement === edge || !sheet.contains(document.activeElement)) {
        e.preventDefault()
        ;(e.shiftKey ? items[items.length - 1] : items[0]).focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      returnTo?.focus?.()
    }
  }, [])

  return (
    <div
      className={styles.scrim}
      onClick={onDismiss}
      role="presentation"
    >
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={[styles.sheet, className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={Title}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={styles.grabber} aria-hidden="true" />
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{Title}</h2>
          {onDismiss && (
            <ButtonIcon
              variant="Tertiary"
              size="S"
              label={`Close ${Title}`}
              icon={<CloseIcon />}
              onClick={onDismiss}
            />
          )}
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
