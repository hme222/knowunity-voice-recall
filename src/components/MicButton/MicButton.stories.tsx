import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { MIC_BUTTON_STATES, MicButton } from './MicButton'

// Verbatim from the Figma component description (micButton, 15648:10629).
const FIGMA_DESCRIPTION = `
**WHAT:** A 120px circular recording control, one variant property, state (Idle/Listening/Captured/Disabled). Icon is real mic artwork reused from the Dark-section input bar, not a swappable iconSlot, colored per state via component.micButton.<state>.glyph.

**WHEN:** One instance per recall screen, the moment a student needs to speak. States map to the recall sequence specifically, idle → listening → captured, not general audio recording elsewhere in the app.

**DON'T:** Don't assume Captured or Disabled are wired into every screen. **Superseded 2026-09-21:** this line previously read “Don't add a fifth state, Idle/Listening/Captured/Disabled is the deliberately complete set”. A fifth state, \`Paused\`, was added because the four-state set failed the rubric's identical-states gate: clicking the mic to pause changed nothing but the aria-label while the pulse ring kept animating, so motion said capturing and text said stopped.

---

**Paused shows the pause glyph** (Lucide pause), not the mic — designer, 2026-10-08 — so the state reads from the control itself and \`RecordingStatus\` drops its "Tap to…" line while paused.

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

export const Paused: Story = {
  args: { state: 'Paused' },
  // `expect` comes from storybook/test, as in Listening above. Destructuring it from the
  // play context threw "expect is not a function" — this story had never actually run.
  play: async ({ canvas }) => {
    const btn = canvas.getByRole('button')
    // It must not look Listening, and it must not report itself as pressed while
    // stopped. It IS still a toggle, so aria-pressed is "false", not absent — the
    // component's own rule ("both recording states are the SAME toggle"). This line
    // used to assert no attribute at all and failed against the component as built.
    await expect(btn).toHaveAttribute('aria-label', 'Paused, tap to resume')
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    // The pause glyph, not the mic (designer, 2026-10-08): Lucide draws pause as two rects.
    await expect(btn.querySelectorAll('svg rect').length).toBe(2)
  },
}
