import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HintCard } from './HintCard'

// Verbatim from the Figma component description (hintCard, 15651:10676).
const FIGMA_DESCRIPTION = `
**WHAT:** A vertical card, a sentence-case "Hint" label plus one body line. No variants, no properties, one fixed treatment.

**WHEN:** A passive, one-directional nudge after a miss, when no reply is expected from the student.

**DON'T:** Don't use it if the student can respond, that's chatBubble's job. Don't confuse it with the live screens' hand-built version, which still reads "HINT" in full caps, that's the old pattern this component replaces, not a variant of it.

---

Built 2026-09-16. Fully bound in Figma; nothing added. Figma's frame hugs its content; here it fills the column, since every card in the 390 layout does.
`

const meta = {
  title: 'Components/HintCard',
  component: HintCard,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  args: { body: 'Think about how the electrons in each bond get shared.' },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof HintCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
