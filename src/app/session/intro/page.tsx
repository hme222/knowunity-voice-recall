'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startRun } from '@/lib/session'

// 00 Intro is retired from the flow (designer, 2026-10-12, option 1b from the senior
// review). With the popup already saying what Say It Back is and the mic asked for in
// context on the first tap, an intro screen and a full-screen primer were two more
// beats of Knowie-plus-paragraph before the first question. The route stays so old
// links and the screens' own fallbacks (useRedirect to /session/intro) still land: it
// starts a clean run and goes to question 1.
export default function IntroPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace(startRun())
  }, [router])
  return null
}
