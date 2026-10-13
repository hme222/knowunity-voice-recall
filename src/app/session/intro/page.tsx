'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startRun } from '@/lib/session'

// 00 Intro is retired from the flow (designer, 2026-10-12, option 1b from the senior review). History: docs/code-history.md#h-055
export default function IntroPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace(startRun())
  }, [router])
  return null
}
