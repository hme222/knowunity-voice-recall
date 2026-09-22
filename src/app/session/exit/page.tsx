'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { returnBack } from '@/lib/navigation'
import { Button, OptionRow, ScreenShell, TextBlock } from '@/components'
import { setSticky, XP } from '@/lib/session'
import styles from './exit.module.css'

// 01b Exit confirmation. Eight real reasons, matching IMG_7511. Tone stays light, no
// guilt — this satisfies "never trap the student", it isn't a retention gate.
//
// The note is the corrected version: per-term XP is banked, only the completion bonus
// is forfeited (docs/sprint-context.md § "XP model", 2026-09-20). The frame's older
// line said all session XP was lost, which contradicted the Design Brief's
// "progress saves, returning resumes".

const REASONS = [
  "I can\u2019t speak out loud right now (I\u2019m around people / in public)",
  'I\u2019d rather type than talk',
  'I was just checking how it looks',
  'I don\u2019t understand how this works',
  'Something didn\u2019t work right (mic / it couldn\u2019t hear me)',
  'I feel awkward talking to the app',
  'The question was bad',
  'Other',
]

/** The two reasons the app can actually do something about. */
const TYPING_ANSWERS = new Set([REASONS[0], REASONS[1]])

export default function ExitPage() {
  const router = useRouter()
  const [picked, setPicked] = useState<string | null>(null)
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
                setSticky()
                router.push('/text/turn?term=1&sticky=1')
              }}
            />
          ) : (
            <Button CTA="Keep learning" variant="Primary" size="M" fullWidth onClick={() => returnBack(router, '/session/idle/1')} />
          )}
          <Button CTA="Leave anyway" variant="Secondary" size="M" fullWidth onClick={() => router.push('/home/unlocked')} />
        </div>
      }
    >
      <div className={styles.body}>
        <TextBlock variant="L" title="What made you stop?" caption="Optional — it helps us make this better." />
        {/* ABOVE the reasons. This sentence is the one thing a wavering student needs,
            and it used to sit under eight reason buttons, 110px below the fold on a
            390x844 screen — so the answer to "what do I lose if I stop" was the one
            thing you could not see. */}
        <p className={styles.note}>
          {`Your progress is saved. You'll keep the XP you've earned — only the +${XP.completionBonus} finishing bonus goes.`}
        </p>
        {/* One question, one answer, so it announces as one group. It was eight
            independent aria-pressed toggles with nothing tying them together.
            "Other" stays selectable and opens nothing, like the other seven —
            sprint-context.md, 2026-09-22. */}
        <div className={styles.reasons} role="radiogroup" aria-label="What made you stop?">
          {REASONS.map((reason) => (
            <OptionRow
              key={reason}
              label={reason}
              inGroup
              state={picked === reason ? 'Selected' : 'Default'}
              onClick={() => setPicked(reason)}
            />
          ))}
        </div>
      </div>
    </ScreenShell>
  )
}
