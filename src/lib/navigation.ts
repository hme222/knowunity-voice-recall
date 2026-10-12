import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Router = ReturnType<typeof useRouter>

const RETURN_KEY = 'sayitback.returnTo'

/**
 * Leaving and coming back, without ever landing on nothing.
 *
 * `router.back()` looks right and is a trap. On a screen opened directly — a deep
 * link, a fresh tab, the first screen of a run — it walks out of the app and lands on
 * `about:blank`. A walkthrough hit it twice: closing the transcript sheet, and tapping
 * "Keep learning" on the exit sheet, which is the reassuring button offered
 * specifically to a student who is wavering. A dead end there is the worst place for
 * one. Guarding on `window.history.length` does not help either: inside an SPA the
 * count is already above 1 before any in-app navigation has happened.
 *
 * So nothing here calls `back()`. The screen being left records itself, and the screen
 * returning reads that — deterministic, and it still works on a cold load because
 * every caller supplies the destination to use when there is no record.
 */
export function rememberReturn() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(RETURN_KEY, window.location.pathname + window.location.search)
  } catch {
    // Private mode, blocked storage. The fallback destination covers it.
  }
}

/** Go back to the remembered screen, or to `fallback` when there isn't one. */
export function returnBack(router: Router, fallback: string) {
  let to = fallback
  if (typeof window !== 'undefined') {
    try {
      const saved = sessionStorage.getItem(RETURN_KEY)
      // Never return to the screen doing the returning.
      if (saved && saved !== window.location.pathname + window.location.search) to = saved
      // One use. Left in place, a later, unrelated return landed on it — Recap →
      // practice → X went back to a session question from much earlier.
      sessionStorage.removeItem(RETURN_KEY)
    } catch {
      // keep the fallback
    }
  }
  router.push(to)
}

/** Open the exit sheet, recording the screen it was opened from. */
export function goToExit(router: Router) {
  rememberReturn()
  router.push('/session/exit')
}

/** Open a branch screen (a sheet), recording where to come back to. */
export function openSheet(router: Router, href: string) {
  rememberReturn()
  router.push(href)
}

/** The term the remembered screen was on (`/session/<screen>/<n>` or `?term=<n>`), if any. */
export function rememberedTerm(): number | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const saved = sessionStorage.getItem(RETURN_KEY) ?? ''
    const m = saved.match(/\/session\/[a-z-]+\/(\d+)/) ?? saved.match(/[?&]term=(\d+)/)
    return m ? Number(m[1]) : undefined
  } catch {
    return undefined
  }
}

/**
 * Redirect when `when` holds, from an effect. Screens used to call `router.replace` in
 * the render pass — a side effect during render that fires twice under StrictMode (dev
 * review, 2026-10-12). Call it before any early return, then `return null` when `when`.
 */
export function useRedirect(when: boolean, href: string) {
  const router = useRouter()
  useEffect(() => {
    if (when) router.replace(href)
  }, [when, href, router])
}
