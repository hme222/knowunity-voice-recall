'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MascotSlot, ScreenShell } from '@/components'
import styles from '../text.module.css'

// The typed path's equivalent of Processing — a brief "checking" beat, no confidence
// tap and no recording states. Short because there is no transcription round trip to
// cover, only judging.

function CheckingScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const index = Number(searchParams.get('term') ?? '1')

  useEffect(() => {
    const id = window.setTimeout(() => router.push(`/session/pass/${index}`), 1200)
    return () => window.clearTimeout(id)
  }, [index, router])

  return (
    <ScreenShell>
      <div className={styles.checking}>
        <div className={styles.mascot}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
        <p className={styles.line}>Checking that against the definition&hellip;</p>
      </div>
    </ScreenShell>
  )
}

export default function CheckingPage() {
  return (
    <Suspense fallback={null}>
      <CheckingScreen />
    </Suspense>
  )
}
