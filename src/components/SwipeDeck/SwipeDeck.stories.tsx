import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { SwipeDeck } from './SwipeDeck'
import { SwipeChip } from '../SwipeChip/SwipeChip'
import { SwipeDots } from '../SwipeDots/SwipeDots'

const DOCS = `
**WHAT:** The gesture behind home's due-signal carousel. Wraps the visible card, reads a
horizontal pointer drag, and calls \`onChange\` with the next index once the pointer has
travelled far enough to mean it.

**WHEN:** Any deck of cards the student moves through by swiping. Today that is
\`/home/due\`, where sprint-context says "the card is swipeable" and, until 2026-09-24,
it was not — the only way to advance was a button labelled "Swipe to the next due quiz".

**DON'T:** Don't use it for a list that scrolls. It claims the horizontal axis and hands
the vertical one back to the browser; a vertical deck would fight the page.
`

const meta = {
  title: 'Components/SwipeDeck',
  component: SwipeDeck,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DOCS } } },
} satisfies Meta<typeof SwipeDeck>

export default meta
type Story = StoryObj<typeof meta>

const QUIZZES = [
  { term: 'Formal charge', due: '9/15', count: '+2' },
  { term: 'Photosynthesis', due: '9/17', count: '+1' },
  { term: 'Kinematics', due: '9/19', count: 'last one' },
]

function Deck() {
  const [active, setActive] = useState(0)
  const quiz = QUIZZES[active]
  return (
    <SwipeDeck active={active} total={QUIZZES.length} onChange={setActive} label="Quizzes due">
      <SwipeChip due QuizLabel={`${quiz.term} · due ${quiz.due}`} Count={quiz.count} />
      <SwipeDots active={active + 1} total={QUIZZES.length} />
    </SwipeDeck>
  )
}

export const ThreeDue: Story = {
  name: 'Three quizzes due — drag to move',
  args: { active: 0, total: 3, onChange: () => {}, label: 'Quizzes due', children: null },
  render: () => <Deck />,
}
