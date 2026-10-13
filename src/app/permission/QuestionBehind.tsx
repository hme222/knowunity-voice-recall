'use client'

import { ChatBubble, MascotSlot } from '@/components'
import { getTerm, SUBJECT, useDrillTerm } from '@/lib/session'
import styles from './permission.module.css'

// The question the student just tapped the mic for, drawn behind the primer sheet and
// the OS prompt. The ask is in context (Design Brief F5; designer 2026-10-12, option
// 1b): the student has already seen what they are about to answer, so the sheet only
// has to say why the mic, not what Say It Back is.
export function QuestionBehind({ next }: { next: string }) {
  const drillTerm = useDrillTerm()
  const m = next.match(/\/session\/recording\/(\d+)/)
  const term = m ? getTerm(Number(m[1])) : drillTerm
  if (!term) return null
  return (
    <div className={styles.behind}>
      <MascotSlot size="2XL" expression="excited" />
      <ChatBubble showTitle title={`${SUBJECT} · Explain: `} titleAccent={term.name} body={term.prompt} className={styles.behindBubble} />
    </div>
  )
}
