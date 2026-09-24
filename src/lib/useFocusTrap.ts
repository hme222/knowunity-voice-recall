'use client'

import { useEffect, type RefObject } from 'react'

// Keeps focus inside an open dialog, and puts it there in the first place.
//
// `aria-modal="true"` SAYS the rest of the page is inert; it does not make it so.
// Nothing is removed from the tab order, so Tab walks straight out of an open dialog
// into a screen the student cannot see — and focus never enters the dialog on open, so
// a keyboard or screen-reader user is never told one appeared.
//
// Written for BottomSheet, then pulled out here when /permission/prompt turned out to
// be the other real dialog in the app and to have the same defect. One implementation,
// because the second copy is where these drift.
//
// Trapped rather than inerting the rest of the page: these dialogs render inside the
// screen's own tree rather than through a portal, so there is no reliable "everything
// else" to mark. The trap is what the student experiences either way.

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function useFocusTrap(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const returnTo = document.activeElement as HTMLElement | null

    const first = root.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? root).focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) {
        e.preventDefault()
        root.focus()
        return
      }
      const edge = e.shiftKey ? items[0] : items[items.length - 1]
      if (document.activeElement === edge || !root.contains(document.activeElement)) {
        e.preventDefault()
        ;(e.shiftKey ? items[items.length - 1] : items[0]).focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      returnTo?.focus?.()
    }
  }, [ref])
}
