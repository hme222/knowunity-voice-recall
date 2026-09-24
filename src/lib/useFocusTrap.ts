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
    // NO focus restore on unmount.
    //
    // It used to capture document.activeElement here and refocus it on cleanup, which
    // reads correctly and does nothing: every sheet in this app lives on its own route
    // (session/transcript/[bucket], drill/complete/round, permission/prompt), so by the
    // time this mounts the triggering control has already unmounted and activeElement
    // is <body>. Restoring <body> to <body> is not a restore. Honest no-op beats a
    // convincing one — a real fix has to hand the trigger's identity across the
    // navigation, which is the routing layer's job, not this hook's.

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
    }
  }, [ref])
}
