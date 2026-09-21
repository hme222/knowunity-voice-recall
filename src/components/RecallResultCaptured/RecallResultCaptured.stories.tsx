import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Chips } from '../Chips/Chips'
import { RecallResultCaptured } from './RecallResultCaptured'

const DESCRIPTION = `
**WHAT:** The captured-take card. Shows what the student said *before* anything is judged, with a retry tag and the "You said" eyebrow. Figma's \`recallResult/Captured\` (15782:13076).

**WHEN:** 02a Captured and DD 02a — the review beat between recording and judging. It is what makes a mishear read as "the app misheard me" rather than "I failed" (voice-ux Principle 4).

**DON'T:** Don't expect a verdict on it. It is a sibling of the \`recallResult\` set, not a fourth state of it, precisely because nothing has been judged at this point. Don't reach for it after a verdict — \`RecallResult\` covers Pass, Miss and CouldntHear.

---

Promoted 2026-09-20 from an inline card on 02a when DD 02a became a second consumer — the promote rule in \`component-gaps.md\`. A spec review caught that the promotion had been predicted but never done.
`

const meta = {
  title: 'Components/RecallResultCaptured',
  component: RecallResultCaptured,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: {
    title: "Here's what I heard. Send it, or say it again.",
    transcript:
      "It's the charge on an atom if you split every bond's electrons evenly between the two atoms.",
  },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof RecallResultCaptured>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithRetryTag: Story = {
  name: 'With the retry tag',
  args: { tag: <Chips Text="Try again" size="S" color="Coral" active showRightIcon={false} /> },
}

export const ShortTake: Story = {
  name: 'A short take',
  args: { transcript: 'It’s about electrons being shared.' },
}
