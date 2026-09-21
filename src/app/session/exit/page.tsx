'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  'Room is too noisy',
  "I'd rather type",
  'Talking to the app feels awkward',
  "The question wasn't clear",
  "I don't know this material yet",
  'Just checking it out',
  "I'm out of time",
  'Something else',
]

export default function ExitPage() {
  const router = useRouter()
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          <Button CTA="Keep learning" variant="Primary" size="M" fullWidth onClick={() => router.back()} />
          <Button CTA="Leave anyway" variant="Secondary" size="M" fullWidth onClick={() => router.push('/')} />
        </div>
      }
    >
      <div className={styles.body}>
        <TextBlock variant="L" title="What made you stop?" caption="Optional — it helps us make this better." />
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
        <p className={styles.note}>
          {`Your progress is saved. You'll keep the XP you've earned — only the +${XP.completionBonus} finishing bonus goes.`}
        </p>
      </div>
    </ScreenShell>
  )
}
