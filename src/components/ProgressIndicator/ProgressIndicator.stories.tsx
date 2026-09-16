import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PROGRESS_STEPS, PROGRESS_THICKNESSES, PROGRESS_VARIANTS, ProgressIndicator } from './ProgressIndicator'

// Verbatim from the Figma component description (progressIndicator, 9003:8923).
const FIGMA_DESCRIPTION = `
**WHAT:** A progress rectangle inside a container, plus a current/total text label (sampled "0/12"). Variants: Primary/Coral, thickness 24/16, progress in 25% steps.

**WHEN:** Confirmed in real use nested inside the top app bar's slot, very likely the "N/4" progress indicator documented for the recall turn screens.

**DON'T:** Don't use the text label as free-form copy, it's a fixed current/total pattern. Don't expect a smooth in-between state, progress moves in fixed 25% steps.

---

Built 2026-09-16. Track height bound in Figma to \`space.600\` / \`space.400\` and its radius to \`radius.full\` the same day. The 2px inset on the 24 thickness is \`space.050\`. Figma's \`border/subtle\` is not a local variable; it resolves to the same value as \`border.default\`, which is used here.
`

const meta = {
  title: 'Components/ProgressIndicator',
  component: ProgressIndicator,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: {
    variant: { control: 'radio', options: PROGRESS_VARIANTS },
    thickness: { control: 'radio', options: PROGRESS_THICKNESSES },
    progress: { control: 'radio', options: PROGRESS_STEPS },
  },
  args: { variant: 'Primary', thickness: '24', progress: '50', showText: false, current: 6, total: 12 },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof ProgressIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
export const Coral: Story = { args: { variant: 'Coral' } }
export const Thickness24: Story = { name: 'thickness=24', args: { thickness: '24' } }
export const Thickness16: Story = { name: 'thickness=16', args: { thickness: '16' } }
export const WithText: Story = { name: 'showText=true', args: { showText: true } }
export const Steps: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 'calc(var(--size-primitive-space-300) * 1px)' }}>
      {PROGRESS_STEPS.map((p) => <ProgressIndicator key={p} {...args} progress={p} current={(Number(p) / 100) * 12} total={12} showText />)}
    </div>
  ),
}
