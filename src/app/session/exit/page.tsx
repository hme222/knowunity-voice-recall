'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { returnBack } from '@/lib/navigation'
import { Button, OptionRow, ScreenShell, TextBlock } from '@/components'
import { XP } from '@/lib/session'
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

export default function ExitPage() {
  const router = useRouter()
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          <Button CTA="Keep learning" variant="Primary" size="M" fullWidth onClick={() => returnBack(router, '/session/idle/1')} />
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
        <div className={styles.reasons}>
          {REASONS.map((reason) => (
            <OptionRow
              key={reason}
              label={reason}
              state={picked === reason ? 'Selected' : 'Default'}
              onClick={() => setPicked(reason)}
            />
          ))}
        </div>
      </div>
    </ScreenShell>
  )
}
