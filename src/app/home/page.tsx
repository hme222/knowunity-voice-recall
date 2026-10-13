'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components'
import { DOORS } from '../door/doors'
import { HomeShell } from './HomeShell'
import styles from './home.module.css'

// Home, before first encounter. History: docs/code-history.md#h-040

export default function HomePage() {
  const router = useRouter()
  return (
    <HomeShell>
      <>
        {/* The tool chips, the composer and the tab bar are HomeShell's now — they are the host app's chrome and were being rebuilt on each of the three home routes. History: docs/code-history.md#h-041 */}
        <p className={styles.doorsNote}>Say It Back isn&rsquo;t here yet. It appears after you meet it:</p>
        <div className={styles.doors}>
          {DOORS.map((door) => (
            <Button
              key={door.id}
              CTA={door.homeLabel}
              variant="Tertiary"
              size="M"
              fullWidth
              onClick={() => router.push(door.href)}
            />
          ))}
        </div>
      </>
    </HomeShell>
  )
}
