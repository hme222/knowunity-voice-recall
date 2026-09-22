'use client'

import { useRouter } from 'next/navigation'
import { Button, MascotSlot, ScreenShell } from '@/components'
import styles from '../permission.module.css'

// Mic permission primer. No Figma frame — this exists only as a journey-map node.
// voice-ux Principle 3: never fire the OS request cold. Prime it with our own screen
// that explains the value, triggered by a clear user action, then let the OS dialog
// appear. Modelled on Babbel, which asks at the speaking-practice moment.

export default function PrimerPage() {
  const router = useRouter()
  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA="Turn on the mic"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push('/permission/prompt')}
          />
          <Button CTA="Not now" variant="Tertiary" size="M" fullWidth onClick={() => router.push('/text/turn')} />
        </div>
      }
    >
      <div className={styles.body}>
        {/* "Ready to say it out loud?" is an invitation, not a wait. */}
        <MascotSlot size="2XL" expression="excited" />
        <div className="screenTitle">
          <h1 className="screenTitleHeading">Ready to say it out loud?</h1>
          <p className="screenTitleCaption">Knowie needs your mic to hear your answer. It only listens while you’re recording, and nothing is kept anywhere else. You can always type instead.</p>
        </div>
      </div>
    </ScreenShell>
  )
}
