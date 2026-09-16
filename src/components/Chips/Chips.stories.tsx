import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CHIPS_COLORS, CHIPS_SIZES, Chips } from './Chips'

// Verbatim from the Figma component description (chips, 9003:8679).
const FIGMA_DESCRIPTION = `
**WHAT:** Optional leading iconSlot, text label, optional trailing iconSlot. Variants: size (XXS/XS/S/M), color (Primary/pro/Coral), active (boolean). Coral is new: fill/text bound to feedback.unclear.bold/onBold, only built at size=S, active=True, the one cell recallResult's CouldntHear state needed as a retry tag.

**WHEN:** Confirmed in real use standalone and grouped (a chipsGroup context appeared twice). GUESS, not confirmed: the active boolean strongly suggests this backs the Topic Picker's selected-topic chips, inferred from the prop name matching documented behavior, not independently verified. Coral specifically is confirmed only inside recallResult's CouldntHear state.

**DON'T:** Don't use the pro color casually, given the Pro badge context elsewhere in this file it's almost certainly reserved for subscription-gated content. Don't assume Coral exists at other sizes or active=False, only one cell is built.

---

Built 2026-09-16. Heights bound in Figma the same day: XXS \`icon.250\`, XS \`icon.300\`, S/M \`component.button.s/m.height\`.
`

const meta = {
  title: 'Components/Chips',
  component: Chips,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: {
    size: { control: 'radio', options: CHIPS_SIZES },
    color: { control: 'radio', options: CHIPS_COLORS },
    leftIcon: { control: false },
    rightIcon: { control: false },
  },
  args: { Text: 'Chemistry', size: 'S', color: 'Primary', active: false, showLeftIcon: true, showRightIcon: true },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof Chips>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { color: 'Primary' } }
export const Pro: Story = { name: 'pro', args: { color: 'pro', active: true } }
export const Coral: Story = { args: { color: 'Coral', active: true, Text: 'Try again', showRightIcon: false } }
export const Active: Story = { name: 'active=True', args: { active: true } }
export const Inactive: Story = { name: 'active=False', args: { active: false } }
export const XXS: Story = { args: { size: 'XXS' } }
export const XS: Story = { args: { size: 'XS' } }
export const S: Story = { args: { size: 'S' } }
export const M: Story = { args: { size: 'M' } }

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 'calc(var(--size-primitive-space-300) * 1px)' }}>
      {CHIPS_SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'calc(var(--size-primitive-space-200) * 1px)' }}>
          <Chips {...args} size={size} color="Primary" active={false} Text={`${size} Primary`} />
          <Chips {...args} size={size} color="Primary" active Text={`${size} active`} />
          <Chips {...args} size={size} color="pro" active Text={`${size} pro`} />
        </div>
      ))}
      <div style={{ display: 'flex' }}>
        <Chips {...args} size="S" color="Coral" active Text="Try again" showRightIcon={false} />
      </div>
    </div>
  ),
}
