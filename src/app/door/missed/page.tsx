'use client'

import { useRouter } from 'next/navigation'
import { AppBar, Button, HintCard, MascotSlot, ScreenShell } from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, outcomeFor, startSession, SUBJECT, useSession } from '@/lib/session'
import { proveItHref, type DoorId } from '../doors'
import styles from '../door.module.css'

// A door run that ended without a pass: revealed, skipped, or lost to the mic. History: docs/code-history.md#h-006

export default function DoorMissedPage() {
  const router = useRouter()
  const state = useSession()
  // A door run is always term 1 (proveItHref).
  const current = getTerm(1)
  const outcome = outcomeFor(state, 1)
  const door = (state.door ?? 'quiz') as DoorId
  const micTrouble = Boolean(outcome?.micTrouble)

  if (!current) return null

  const toUnlock = () => router.push('/home/unlock')

  return (
    <ScreenShell
      topNavigation={<AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={toUnlock} />}
      bottomContent={
        <div className={styles.actions}>
          {/* Continue leads: the run is over, and the unlock is where it goes next. Trying
              again is offered, not pushed. */}
          <Button CTA="Continue" variant="Primary" size="M" fullWidth onClick={toUnlock} />
          <Button
            CTA="Try again"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => {
              startSession({ door })
              router.push(proveItHref(door))
            }}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.content}>
          {/* `determined`, as on a Recap with something to revisit: "let's go", never
              dazed at the student. On mic trouble the app failed, which is `dazed`'s
              job (design-system.md § Mascot poses). */}
          <MascotSlot size="2XL" expression={micTrouble ? 'dazed' : 'sad'} />
          <div className="screenTitle">
            <h1 className="screenTitleHeading">{micTrouble ? 'The mic didn’t catch that one' : 'Not this one yet'}</h1>
            <p className="screenTitleCaption">
              {`Here’s ${current.name.toLowerCase()}, for next time. Try it again anytime from Say It Back.`}
            </p>
          </div>
        </div>
        <HintCard label={`${SUBJECT} · ${current.name}`} body={current.answer} />
      </div>
    </ScreenShell>
  )
}
