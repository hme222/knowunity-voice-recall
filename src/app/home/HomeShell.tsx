'use client'

import type { ReactNode } from 'react'
import { ScreenShell } from '@/components'
import { HOME_GREETING } from '@/lib/session'
import styles from './home.module.css'

// The home surround. The real app's home is not ours to reproduce — these are
// stand-ins so the Say It Back surfaces can be judged in context rather than floating.

export function HomeShell({ children }: { children: ReactNode }) {
  return (
    <ScreenShell>
      <div className={styles.body}>
        <p className={styles.greeting}>{HOME_GREETING}</p>
        <div className={styles.placeholderCard}>Your study plan</div>
        <div className={styles.placeholderCard}>Recent notes</div>
        {children}
      </div>
    </ScreenShell>
  )
}
