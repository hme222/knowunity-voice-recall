import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { MIC_BUTTON_STATES, MicButton } from './MicButton'

// Verbatim from the Figma component description (micButton, 15648:10629).
const FIGMA_DESCRIPTION = `
**WHAT:** A 120px circular recording control, one variant property, state (Idle/Listening/Captured/Disabled). Icon is real mic artwork reused from the Dark-section input bar, not a swappable iconSlot, colored per state via component.micButton.<state>.glyph.

**WHEN:** One instance per recall screen, the moment a student needs to speak. States map to the recall sequence specifically, idle → listening → captured, not general audio recording elsewhere in the app.

**DON'T:** Don't add a fifth state. Idle/Listening/Captured/Disabled is the deliberately complete set, see design-system.md open question 1. Don't assume Captured or Disabled are wired into any screen yet, only Idle and Listening currently appear live anywhere.

---

Built 2026-09-16. Glyph box is \`component.micButton.glyph.size\` (48), added and bound in Figma the same day. The Listening pulse ring is additive motion on \`duration.ambient\`, off under reduced motion; the fill alone carries the state.
`

const meta = {
  title: 'Components/MicButton',
  component: MicButton,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { state: { control: 'radio', options: MIC_BUTTON_STATES } },
  args: { state: 'Idle' },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-between-sections) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof MicButton>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {}
export const Listening: Story = {
  args: { state: 'Listening' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /listening/i })).toHaveAttribute('aria-pressed', 'true')
  },
}
export const Captured: Story = { args: { state: 'Captured' } }
export const Disabled: Story = { args: { state: 'Disabled' } }
