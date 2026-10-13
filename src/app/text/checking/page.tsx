'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Chips, MascotSlot, ProcessingBeat, RecallResultCaptured, ScreenShell } from '@/components'
import capturedStyles from '../../session/captured/[term]/captured.module.css'
import { CheckIcon } from '@/components/icons'
import { DrillBar } from '../../drill/DrillBar'
import drillStyles from '../../drill/drill.module.css'
import styles from '../text.module.css'
import { processingDwell, verdictHold } from '@/lib/motion'
import { SessionBar } from '../../session/SessionBar'
import { DRILL_TOTAL_RUNGS, markEarned, recordConfidence, recordMiss, typedVerdict, unsendTypedAnswer, useSession } from '@/lib/session'
import { doorResultHref } from '@/app/door/doors'

// The typed path's equivalent of 03 Processing. History: docs/code-history.md#h-089

function CheckingScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const index = Number(searchParams.get('term') ?? '1')
  // The typed path's mock, parallel to the spoken one: recording duration selects the
  // verdict there, answer length here. A typed miss has to be reachable — a path that
  // can only ever pass isn't a judged path at all.
  const len = Number(searchParams.get('len') ?? '0')
  // Read after the store: the typed text decides it, not its length alone.
  // Too short to have said anything checkable ("idk lol"). The miss screen then says so
  // instead of crediting part of a definition the student never wrote (designer,
  // 2026-10-12, from the critic panel).
  const thin = len < 15
  // A drill turn returns to the drill. It used to land in /session/pass and the
  // student continued into a 4-term session they never started.
  const drillStep = searchParams.get('drill')

  const [asking, setAsking] = useState(false)
  // The optional confidence call, as on 02a Captured: two small chips, read on "Looks
  // good" (designer, 2026-10-13: "match the chips").
  const [sure, setSure] = useState<boolean | undefined>(undefined)
  // A typed drill round that passed says "Got it" before the next, as a spoken one does.
  const [got, setGot] = useState(false)

  // Once only: the grace timer and a tap can both land, and a double tap on Sure ran
  // this twice — recordMiss twice for one miss (engineering review, 2026-10-13).
  const doneRef = useRef(false)
  const state = useSession()
  const typedText = state.sentTyped?.[index] ?? state.typed?.[index] ?? ''
  const verdict = typedVerdict(index, typedText || 'x'.repeat(len))

  const onward = (sure?: boolean) => {
    if (doneRef.current) return
    doneRef.current = true
    if (drillStep) {
      // The last rung finishes the drill, as the spoken path does. Typed, rung 4's pass
      // pushed /drill/pass/5, which does not exist, and bounced to the drill intro.
      const step = Number(drillStep)
      // A miss goes to the stumble with the typed words, not the spoken mock's take.
      if (verdict !== 'pass') return router.replace('/drill/miss?typed=1')
      if (step >= DRILL_TOTAL_RUNGS) markEarned(state.drillTerm ?? index, 'Drill')
      setGot(true)
      window.setTimeout(() => router.replace(step >= DRILL_TOTAL_RUNGS ? '/drill/complete' : `/drill/pass/${step + 1}`), verdictHold())
      return
    }
    if (sure !== undefined) {
      // Same call 03 Processing makes, so a typed turn lands in the same ledger — but with THIS path's own verdict, not a duration fed through the spoken mock. History: docs/code-history.md#h-090
      recordConfidence(index, sure, verdict === 'pass' ? 'Pass' : 'Miss')
    }
    const q = new URLSearchParams()
    if (sure !== undefined) q.set('sure', sure ? '1' : '0')
    if (verdict === 'miss' && thin) q.set('thin', '1')
    if (verdict === 'miss') recordMiss(index)
    if (verdict === 'pass') {
      // A door run's typed pass goes to the door's own result, as a spoken one does.
      const doorResult = doorResultHref(state.door ?? null)
      if (doorResult) {
        router.replace(doorResult)
        return
      }
      markEarned(index, 'Pass')
    }
    router.replace(`/session/${verdict}/${index}?${q}`)
  }

  // Too short to check means no confidence question either (usability review,
  // 2026-10-12): asking how sure someone is about "a charge", then saying there was
  // nothing to check, is the question 03 Processing already declines for an unusable take.
  useEffect(() => {
    const id = window.setTimeout(() => (drillStep || thin ? onward() : setAsking(true)), processingDwell())
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, router, verdict, drillStep])

  // Asking is now 02a Captured's shape exactly: the words, "How sure?" chips, then
  // "Looks good" / "Not quite right" (designer, 2026-10-13). "Not quite right" reopens
  // the typed turn with the student's words in it, to edit rather than retype.
  if (asking && !drillStep) {
    return (
      <ScreenShell
        topNavigation={<SessionBar index={index} />}
        bottomContent={
          <div className={capturedStyles.actions}>
            <Button CTA="Looks good" variant="Primary" size="M" fullWidth onClick={() => onward(sure)} />
            <Button
              CTA="Not quite right"
              variant="Tertiary"
              size="S"
              fullWidth
              onClick={() => {
                doneRef.current = true
                unsendTypedAnswer(index)
                router.replace(`/text/turn?term=${index}${searchParams.get('sticky') === '1' ? '&sticky=1' : ''}`)
              }}
            />
          </div>
        }
      >
        <div className={capturedStyles.body}>
          <MascotSlot size="2XL" expression="excited" />
          <RecallResultCaptured className={capturedStyles.card} title="Here’s what you wrote." label="You wrote" transcript={typedText.trim()} />
          <div className={capturedStyles.sure} role="group" aria-label="How sure are you? Optional">
            <span className={capturedStyles.sureLabel}>How sure?</span>
            <Chips Text="Sure" size="S" color="Primary" toggle active={sure === true} showLeftIcon={false} showRightIcon={false} onClick={() => setSure(sure === true ? undefined : true)} />
            <Chips Text="Not sure" size="S" color="Primary" toggle active={sure === false} showLeftIcon={false} showRightIcon={false} onClick={() => setSure(sure === false ? undefined : false)} />
          </div>
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell
      topNavigation={drillStep ? <DrillBar step={Number(drillStep)} onExit={() => router.push('/picker')} skip={false} /> : <SessionBar index={index} />}
      // Reserve the action zone before the question arrives. History: docs/code-history.md#h-091
      showBottomNavSlot
    >
      <div className={styles.checkingBody}>
        <ProcessingBeat
          line={
            got
              ? Number(drillStep) >= DRILL_TOTAL_RUNGS
                ? 'Got it. That’s the whole definition.'
                : `Got it. On to round ${Number(drillStep) + 1}.`
              : 'Checking that against the definition…'
          }
          // No "working" dots while the question waits on the student, or once judged.
          working={!got}
          // The typed answer shown back before judging, as the spoken path shows its
          // transcript (UX critic, 2026-10-13).
          above={
            got ? (
              <div className={drillStyles.verdictRow}>
                <Chips Text="Got it" size="S" color="Primary" active showLeftIcon leftIcon={<CheckIcon />} showRightIcon={false} />
              </div>
            ) : undefined
          }
        />
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
