import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TrainingLog } from './TrainingLog'

const DESCRIPTION = `
**WHAT:** The "what you climbed" list on the drill's Complete screen. One row per pass the student actually took, with the final unaided round marked green. Tapping a row opens that take's transcript.

**WHEN:** DD 08 Complete, and behind the round-tapped sheet.

**DON'T:** Don't assume four rows. The drill is variable-length — a strong student finishes in two passes, a struggling one in six — so the row count is whatever happened. Figma's footer reads "all four takes", which is a leftover from the fixed ladder; the count here is derived instead. Don't put plain \`background.surface\` rows on a \`background.surface\` parent either: the card is deliberately darker so its rows read as raised.

---

Built 2026-09-20. Figma's card fill was a literal \`#1a1c2e\`; bound to \`background.input\` (navy-900), the nearest real value.
`

const meta = {
  title: 'Components/TrainingLog',
  component: TrainingLog,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: {
    rounds: [
      { label: 'Round 1 · Full definition' },
      { label: 'Round 2 · One word gone' },
      { label: 'Round 3 · Several gone' },
      { label: 'Round 4 · All you', final: true },
    ],
  },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof TrainingLog>

export default meta
type Story = StoryObj<typeof meta>

export const FourRounds: Story = { name: 'Four passes' }
export const TwoRounds: Story = {
  name: 'Two passes — a strong student',
  args: { rounds: [{ label: 'Round 1 · Full definition' }, { label: 'Round 2 · All you', final: true }] },
}
export const SixRounds: Story = {
  name: 'Six passes — a struggling student',
  args: {
    rounds: [
      { label: 'Round 1 · Full definition' },
      { label: 'Round 2 · One word gone' },
      { label: 'Round 3 · One word gone' },
      { label: 'Round 4 · Several gone' },
      { label: 'Round 5 · Several gone' },
      { label: 'Round 6 · All you', final: true },
    ],
  },
}
