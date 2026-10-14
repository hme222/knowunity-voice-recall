import { micGate } from '@/lib/session'

// The doors: the three places Say It Back is met for the first time. History: docs/code-history.md#h-004

export type DoorId = 'quiz' | 'exam-plan' | 'chat'

export type Door = {
  id: DoorId
  /** The route the door lives at. */
  href: string
  /** How home names it, before the feature exists there. */
  homeLabel: string
}

export const DOORS: Door[] = [
  { id: 'quiz', href: '/door/quiz', homeLabel: 'Finish a quiz' },
  { id: 'exam-plan', href: '/door/exam-plan', homeLabel: 'Open the exam plan' },
  { id: 'chat', href: '/door/chat', homeLabel: 'Ask Knowie in chat' },
]

/** Where a door sends the student to speak: the real recall turn, term 1. */
export function proveItHref(door: DoorId, term = 1): string {
  return `/session/idle/${term}?door=${door}`
}

/**
 * Where a door's own mic goes: straight to recording on term 1, through the permission
 * primer if the mic is not granted yet. The chat and exam-plan doors already show the
 * question with a mic under it, so landing on 01 Idle asked for a second tap on the
 * same control (designer, 2026-10-14).
 */
export function doorMicHref(door: DoorId, term = 1): string {
  return micGate(`/session/recording/${term}?door=${door}`, `/text/turn?term=${term}`)
}

/**
 * Where a door-run Pass lands. The quiz door has its own result frame ("Prove It
 * Again — term result", 15672:19827); the other two fall through to the session's own
 * verdict screens, which is the same screen doing the same job.
 */
export function doorResultHref(door: string | null): string | null {
  return door === 'quiz' ? '/door/quiz/result' : null
}
