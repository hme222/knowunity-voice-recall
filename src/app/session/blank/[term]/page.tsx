'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import { AppBar, Button, ChatBubble, MascotSlot, MicButton, ScreenShell } from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm } from '@/lib/session'
import styles from '../../interrupt.module.css'

// A genuinely blank term — not a near-miss, nothing at all. This answers the Design
// Brief's first open question, which had gone unanswered: encourage one attempt, then
// reveal. A wrong attempt still beats silence for retrieval.
//
// Distinct from Skip, which stays a silent exit. Skip is avoidance; this is a student
// saying "I don't know this", which is different information.

export default function BlankPage({ params }: { params: Promise<{ term: string }> }) {
  const router = useRouter()
  const { term } = use(params)
  const index = Number(term)
  const current = getTerm(index)

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  return (
    <ScreenShell
      topNavigation={
        <AppBar
          variant="leftIconButtonOnly"
          leftIcon={<CloseIcon />}
          leftLabel="Leave"
          onLeft={() => goToExit(router)}
        />
      }
      bottomContent={
        <div className={styles.actions}>
          <MicButton state="Idle" label="Say whatever you've got" onClick={() => router.push(`/session/recording/${index}`)} />
          <Button CTA="Just show me" variant="Tertiary" size="M" fullWidth onClick={() => router.push(`/session/reveal/${index}`)} />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" />
        <ChatBubble
          showTitle
          title="Drawing a blank?"
          body="Say whatever you've got — even half of it. Getting it wrong out loud sticks better than reading the answer, and nothing here is scored against you."
        />
      </div>
    </ScreenShell>
  )
}
