import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SwipeDots } from './SwipeDots'

const DESCRIPTION = `
**WHAT:** Carousel position for the swipeable due-quiz chips. The active dot uses \`feedback.warning.border\` — the same token as the chip's border — so the pager and the thing it pages read as one system.

**WHEN:** Under the due-signal chips on the plan-active home, whenever more than one quiz is due.

**DON'T:** Don't assume three. Figma only builds \`active=1|2|3\` because the sample batch is three, but the real batch is however many quizzes are due — this takes \`total\` for that reason. Hardcoding three would be the same fixed-count-that-lies problem the drill's four-rung ladder had.

---

Built 2026-09-20. Transition timing uses \`motion.duration.swipe\`, which is an unverified 300ms — see \`docs/tokens-update.md\`.
`

const meta = {
  title: 'Components/SwipeDots',
  component: SwipeDots,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: { active: 1, total: 3 },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof SwipeDots>

export default meta
type Story = StoryObj<typeof meta>

export const First: Story = { name: 'active=1', args: { active: 1 } }
export const Second: Story = { name: 'active=2', args: { active: 2 } }
export const Third: Story = { name: 'active=3', args: { active: 3 } }
export const LargerBatch: Story = { name: 'Five due', args: { active: 3, total: 5 } }
