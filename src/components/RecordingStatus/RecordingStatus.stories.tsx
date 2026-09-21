import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RecordingStatus } from './RecordingStatus'

const DESCRIPTION = `
**WHAT:** The three text elements on a recording screen — the \`LISTENING\` label, the elapsed timer, and the pause caption. Loose text nodes on the Figma frame; one component here because all three describe the same state and must never disagree.

**WHEN:** 02 Recording and DD 02 Recording, in the bottom region beneath the mic.

**DON'T:** Don't let it own the clock. The page ticks and passes \`seconds\` — a component running its own interval makes its story non-deterministic and flakes the a11y run. The mic changes too: \`MicButton\` gained a real \`Paused\` state on 2026-09-21, after the previous "nothing changes when paused" behaviour failed the identical-states gate.

---

Built 2026-09-20. \`0:04\` matches the value on the Figma frame.
`

const meta = {
  title: 'Components/RecordingStatus',
  component: RecordingStatus,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: { seconds: 4, paused: false },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof RecordingStatus>

export default meta
type Story = StoryObj<typeof meta>

export const Listening: Story = { name: 'Listening — 0:04', args: { seconds: 4 } }
export const Paused: Story = { args: { seconds: 12, paused: true } }
export const LongTake: Story = { name: 'Long take — 1:07', args: { seconds: 67 } }
