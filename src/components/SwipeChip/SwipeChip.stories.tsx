import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SwipeChip } from './SwipeChip'

const DESCRIPTION = `
**WHAT:** The Say It Back chip on home. Mic glyph, label, optional term-and-due-date subtext, optional count badge. \`QuizLabel\` and \`Count\` are the Figma text properties; \`due\` drives the amber border.

**WHEN:** Every home state after the feature is unlocked. Without a plan it is the plain composer chip (\`due={false}\`, no count). With a plan and a nearing deadline it gains the amber border and the count badge. These are two states of one component, not two components — the same relationship the chip and the due-signal card have.

**DON'T:** Don't use the amber border for anything that isn't a deadline. It is bound to \`feedback.warning.border\`, a token added specifically so a bordered warning can move independently of a filled one. Don't show a count without a due date — the badge counts quizzes waiting, and with no plan there are none.

---

Built 2026-09-20. The border previously carried a raw hex in Figma; it is token-bound here.
`

const meta = {
  title: 'Components/SwipeChip',
  component: SwipeChip,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: { QuizLabel: 'Formal charge · due 9/15', Count: '+2', due: true },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof SwipeChip>

export default meta
type Story = StoryObj<typeof meta>

export const Due: Story = { name: 'Plan active — due', args: { due: true } }
export const Baseline: Story = {
  name: 'No plan — baseline chip',
  args: { due: false, QuizLabel: undefined, Count: undefined },
}
export const LastOne: Story = { name: 'Last of the batch', args: { Count: 'last one' } }
export const OneLeft: Story = { name: 'One left', args: { Count: '+1', QuizLabel: 'Kinematics · due 9/19' } }
