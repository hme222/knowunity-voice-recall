import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { KNOWIE_EXPRESSIONS, MASCOT_SLOT_SIZES, MascotSlot } from './MascotSlot'

// Verbatim from the Figma component description (mascotSlot, 9003:8873).
const FIGMA_DESCRIPTION = `
**WHAT:** Wraps a mascot pose instance (sampled at "standby") at one of four sizes (XL-4XL).

**WHEN:** Confirmed in real use in main content areas and a screen's bottomContent region, consistent with onboarding/confirmation screens centering a large Knowie illustration.

**DON'T:** Don't expect it to carry pose logic itself, it wraps whatever mascot instance is swapped in. The slot controls size, not expression.

---

Built 2026-09-16. Expressions come from public/knowie/ (dazed, determined, excited, laughing) per CLAUDE.md; none are drawn here. Height bound in Figma to the same illustration token as width the same day.
`

const meta = {
  title: 'Components/MascotSlot',
  component: MascotSlot,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: {
    size: { control: 'radio', options: MASCOT_SLOT_SIZES },
    expression: { control: 'radio', options: KNOWIE_EXPRESSIONS },
  },
  args: { size: 'XL', expression: 'determined' },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof MascotSlot>

export default meta
type Story = StoryObj<typeof meta>

export const XL: Story = { args: { size: 'XL' } }
export const XL2: Story = { name: '2XL', args: { size: '2XL' } }
export const XL3: Story = { name: '3XL', args: { size: '3XL' } }
export const XL4: Story = { name: '4XL', args: { size: '4XL' } }
export const Expressions: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--size-primitive-space-400) * 1px)' }}>
      {KNOWIE_EXPRESSIONS.map((e) => <MascotSlot key={e} size="2XL" expression={e} />)}
    </div>
  ),
}
