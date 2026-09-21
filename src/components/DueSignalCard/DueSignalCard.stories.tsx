import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DueSignalCard } from './DueSignalCard'

const DESCRIPTION = `
**WHAT:** The home priority card for the plan-active state: amber clock badge, due label, Say It Back action. \`DueLabel\` is the Figma text property.

**WHEN:** One quiz due. With several, the swipeable \`SwipeChip\` carousel supersedes it — this stays because a single due quiz doesn't need a pager.

**DON'T:** Don't show it to a student with no plan. The card reads from the exam/quiz plan's existing due dates; with no plan there are none, and the chip alone is the correct home state.

---

Built 2026-09-20. Its border was a raw hex in Figma and a *different* amber from swipeChip's, despite being the same due-signal accent. Both now bind to \`feedback.warning.border\`.
`

const meta = {
  title: 'Components/DueSignalCard',
  component: DueSignalCard,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: { DueLabel: 'Quiz due 9/15' },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof DueSignalCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const FurtherOut: Story = { name: 'Later deadline', args: { DueLabel: 'Exam due 9/28' } }
