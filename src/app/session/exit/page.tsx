'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { rememberedTerm, returnBack } from '@/lib/navigation'
import { Button, Chips, MascotSlot, ScreenShell } from '@/components'
import { setSticky, useSession, XP, setPractising } from '@/lib/session'
import styles from './exit.module.css'

// 01b Exit confirmation. History: docs/code-history.md#h-052

// Short, in the student's own words, as chips that wrap (designer, 2026-10-14: fit
// without scrolling; microcopy review P3). Order and meaning unchanged: [0] and [1]
// still turn the primary into "Type instead".
const REASONS = [
  'Can\u2019t talk out loud right now',
  'I\u2019d rather type',
  'Just looking around',
  'Not sure how it works',
  'The mic or app didn\u2019t work',
  'Talking to an app feels awkward',
  'The question didn\u2019t make sense',
  'Something else',
]

/** The two reasons the app can actually do something about. */
const TYPING_ANSWERS = new Set([REASONS[0], REASONS[1]])

export default function ExitPage() {
  const router = useRouter()
  const [picked, setPicked] = useState<string | null>(null)
  const started = useSession().outcomes.length > 0
  // "I can't speak out loud right now" and "I'd rather type" both have an answer one
  // tap away, and the sheet used to collect them and route to the mic anyway — it
  // asked and ignored. Picking either turns the primary into the thing they asked for.
  const wantsTyping = picked != null && TYPING_ANSWERS.has(picked)

  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          {wantsTyping ? (
            <Button
              CTA="Type instead"
              variant="Primary"
              size="M"
              fullWidth
              onClick={() => {
                // Back to the question the sheet was opened from, not term 1. Only "can't
                // speak out loud right now" turns the mic off for the session (and pays
                // in full: typing wasn't a choice); "I'd rather type" is a choice, for this
                // question (dev review, 2026-10-12).
                const term = rememberedTerm() ?? 1
                if (picked === REASONS[0]) {
                  setSticky()
                  router.push(`/text/turn?term=${term}&sticky=1`)
                } else {
                  router.push(`/text/turn?term=${term}`)
                }
              }}
            />
          ) : (
            <Button CTA="Keep learning" variant="Primary" size="M" fullWidth onClick={() => returnBack(router, '/session/idle/1')} />
          )}
          <Button
            CTA="Leave anyway"
            // Leaving is the Tertiary tier (button tiers by role, 2026-10-13).
            variant="Tertiary"
            size="M"
            fullWidth
            onClick={() => {
              // Leaving ends a practice round, or it outlives the visit.
              setPractising(false)
              router.push('/home/unlocked')
            }}
          />
        </div>
      }
    >
      <div className={styles.body}>
        {/* Knowie on every screen (designer, 2026-10-14): `questioning`, asking, not
            `sad` — leaving is allowed and should not be guilt-tripped. */}
        <MascotSlot size="2XL" expression="questioning" className={styles.mascot} />
        <div className="screenTitle">
          <h1 className="screenTitleHeading">What made you stop?</h1>
          <p className="screenTitleCaption">Optional — it helps us make this better.</p>
        </div>
        {/* ABOVE the reasons. This sentence is the one thing a wavering student needs,
            and it used to sit under eight reason buttons, 110px below the fold on a
            390x844 screen — so the answer to "what do I lose if I stop" was the one
            thing you could not see. */}
        {/* Only once there is progress to save (critic panel, 2026-10-12): leaving from
            the intro used to promise saved progress and kept XP before any answer. */}
        <p className={styles.note}>
          {started
            ? `Your progress is saved. You'll keep the XP you've earned — only the +${XP.completionBonus} finishing bonus goes.`
            : "You haven’t answered anything yet, so there’s nothing to lose."}
        </p>
        {/* One question, one answer, so it announces as one group. It was eight
            independent aria-pressed toggles with nothing tying them together.
            "Other" stays selectable and opens nothing, like the other seven —
            sprint-context.md, 2026-09-22. */}
        <div className={styles.reasons} role="radiogroup" aria-label="What made you stop?">
          {REASONS.map((reason) => (
            <Chips
              key={reason}
              Text={reason}
              size="M"
              color="Primary"
              active={picked === reason}
              showLeftIcon={false}
              showRightIcon={false}
              // One answer, so radios, not toggles: the group above is a radiogroup.
              role="radio"
              aria-checked={picked === reason}
              onClick={() => setPicked(reason)}
            />
          ))}
        </div>
      </div>
    </ScreenShell>
  )
}
