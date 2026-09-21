import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StrengthMeter } from './StrengthMeter'

const DESCRIPTION = `
**WHAT:** The Definition Drill Down meter. Fills by how much of the definition the student can say **unaided** — coverage of the sentence, not which pass they are on.

**WHEN:** Every drill rung screen. It is the drill's only progress signal; the \`N/4\` fraction and ring belong to the recall loop, not here.

**DON'T:** Don't treat \`fill\` as a step counter. Figma's \`fill=0|25|50|75|100\` variants are a leftover from the fixed four-rung ladder that was removed — a fixed count lies, padding a student who has it in two passes and cutting off one who needs six. Don't ever decrease it either: help holds the meter and never drops it, so a reveal or a miss parks it. A student must never watch progress go backwards for asking for help.

**Depends on two unconfirmed capabilities:** a judge that scores unaided coverage per pass, and per-word stumble tracking. See \`docs/sprint-context.md\` open questions 7 and 8.

---

Built 2026-09-20. Figma's original carried literal hex and a ramp that *darkened* as it filled, making a full meter the least visible state on a dark background. Rebuilt with palette greens running brighter as coverage grows.
`

const meta = {
  title: 'Components/StrengthMeter',
  component: StrengthMeter,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  argTypes: { fill: { control: { type: 'range', min: 0, max: 100, step: 1 } } },
  args: { fill: 0, label: 'How much you can say unaided' },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof StrengthMeter>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = { name: 'First pass — 0', args: { fill: 0 } }
export const Building: Story = { name: 'Building — 35', args: { fill: 35 } }
export const Strong: Story = { name: 'Strong — 70', args: { fill: 70 } }
export const Full: Story = { name: 'Owned it — 100', args: { fill: 100, label: 'You said all of it unaided' } }
export const Ramp: Story = {
  name: 'The ramp',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 'calc(var(--size-primitive-space-400) * 1px)' }}>
      {[0, 20, 40, 60, 80, 100].map((f) => (
        <StrengthMeter key={f} fill={f} label={`${f}% unaided`} />
      ))}
    </div>
  ),
}
