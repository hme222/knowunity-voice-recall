'use client'

import { useRouter } from 'next/navigation'
import { AppBar, Button, HintCard, MascotSlot, ScreenShell } from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, outcomeFor, startSession, SUBJECT, useSession } from '@/lib/session'
import { proveItHref, type DoorId } from '../doors'
import styles from '../door.module.css'

// A door run that ended without a pass: revealed, skipped, or lost to the mic. No
// Figma frame; added 2026-10-12 (designer, option 1a from the usability review).
//
// A door run is one definition (sprint-context, 2026-10-12) and used to go straight to
// the "Say It Back feature unlocked" popup whatever happened, so a student who skipped
// or was shown the answer got a celebration and nothing about the definition. The
// start screen promises step 3, "See how it landed". This is that step for a miss: the
// definition to take away, a way to try again, and only then the unlock. A pass already
// has its own result (the quiz door's, or 04 Pass).

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
            CTA="Try it again"
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
          <MascotSlot size="2XL" expression={micTrouble ? 'dazed' : 'determined'} />
          <div className="screenTitle">
            <h1 className="screenTitleHeading">{micTrouble ? 'The mic didn’t catch that one' : 'Not this one yet'}</h1>
            <p className="screenTitleCaption">
              {`Here’s ${current.name.toLowerCase()}, for next time. Say It Back will have it whenever you want another go.`}
            </p>
          </div>
        </div>
        <HintCard label={`${SUBJECT} · ${current.name}`} body={current.answer} />
      </div>
    </ScreenShell>
  )
}
