'use client'

import { useRef, useState, type ReactNode } from 'react'
import styles from './SwipeDeck.module.css'

// The gesture behind the due-signal carousel on home.
//
// sprint-context.md § "Where it lives" says "the card is swipeable… each swipe shows a
// different quiz". It was not: the only way to advance was a tertiary button reading
// "Swipe to the next due quiz", which told the student to swipe and then required a tap.
// Dragging the card did nothing and tapping it started the session.
//
// Pointer events rather than touch events, so the same code serves a finger, a trackpad
// drag and a mouse — and so a reviewer on a desktop browser can exercise it at all.
//
// Three things this has to get right beyond "it moves":
//   - Vertical scrolling must survive. `touch-action: pan-y` hands the browser the
//     vertical axis and keeps the horizontal one.
//   - A drag must not fire the card's own onClick. The card navigates into a session,
//     so a swipe that also started the session would be worse than no swipe at all.
//     `onClickCapture` swallows the click when the pointer actually travelled.
//   - It must work without a pointer. Arrow keys move the deck, and the whole thing is
//     a labelled group that reports its position.

/** How far the pointer must travel before it counts as a swipe rather than a tap. */
const THRESHOLD = 48
/** Slop before the gesture takes over the pointer. Below this it is still a tap. */
const CAPTURE_AFTER = 8

export type SwipeDeckProps = {
  /** Index of the visible card. */
  active: number
  /** How many cards there are. */
  total: number
  /** Called with the new index. Wraps at both ends, so no direction is ever dead. */
  onChange: (next: number) => void
  /** Describes the deck to a screen reader, e.g. "Quizzes due". */
  label: string
  children: ReactNode
  className?: string
}

export function SwipeDeck({ active, total, onChange, label, children, className }: SwipeDeckProps) {
  const startX = useRef<number | null>(null)
  const travelled = useRef(0)
  const [dx, setDx] = useState(0)

  function step(delta: number) {
    if (total < 2) return
    onChange((active + delta + total) % total)
  }

  function end() {
    if (startX.current === null) return
    const moved = travelled.current
    startX.current = null
    setDx(0)
    if (Math.abs(moved) >= THRESHOLD) step(moved < 0 ? 1 : -1)
  }

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${label}, ${active + 1} of ${total}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
      }}
      onPointerDown={(e) => {
        if (total < 2) return
        startX.current = e.clientX
        travelled.current = 0
      }}
      onPointerMove={(e) => {
        if (startX.current === null) return
        travelled.current = e.clientX - startX.current
        // Capture LAZILY, once this is clearly a drag. Capturing on pointerdown
        // retargets the whole gesture to this element, so the click that follows a
        // plain tap never reaches the card — and the card is how the student starts the
        // session. A few pixels of slop is the difference between a tap and a swipe.
        if (Math.abs(travelled.current) > CAPTURE_AFTER && !e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.setPointerCapture(e.pointerId)
        }
        setDx(travelled.current)
      }}
      onPointerUp={end}
      onPointerCancel={end}
      // A drag that ends on the card would otherwise also be a click, and this card's
      // click starts a session.
      onClickCapture={(e) => {
        if (Math.abs(travelled.current) >= THRESHOLD) {
          e.preventDefault()
          e.stopPropagation()
        }
        travelled.current = 0
      }}
    >
      <div
        className={styles.track}
        // The only inline style in the component, and it has to be: the value is the
        // live pointer delta, which no token can carry. It is zero except mid-drag.
        style={dx ? { transform: `translateX(${dx}px)` } : undefined}
        data-dragging={dx ? true : undefined}
      >
        {children}
      </div>
    </div>
  )
}
