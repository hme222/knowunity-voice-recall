import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StrengthMeter } from '../StrengthMeter/StrengthMeter'
import { ProcessingBeat } from './ProcessingBeat'

const DESCRIPTION = `
**WHAT:** The wait. Knowie breathing, a status line, three dots — one composition shared by 03 Processing, DD 03 and the typed checking beat.

**WHEN:** Any time the app is covering a round trip. \`above\` takes anything that belongs over the mascot; only DD 03 uses it, for its coverage meter.

**DON'T:** Don't add a spinner. Knowie breathing IS the working signal, so the wait has somewhere to live that isn't a dead indicator. Don't rely on the motion: both the breathe and the dots stop under \`prefers-reduced-motion\`, and the line has to carry the state alone.

Extracted 2026-09-22. The three waits had drifted into three shapes — different mascot heights, dots on one of them, and the typed beat dropping the app bar entirely so the chrome blinked for one screen mid-flow.
`

const meta = {
  title: 'Components/ProcessingBeat',
  component: ProcessingBeat,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: { line: 'Let me check that against the definition…' },
  decorators: [(Story) => <div style={{ height: 420, display: 'flex' }}><Story /></div>],
} satisfies Meta<typeof ProcessingBeat>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The slow-judge escalation. Same screen, same shape, different words. */
export const Slow: Story = {
  args: { line: 'Still thinking — hang on, this one is taking a moment.' },
}

/** DD 03, which puts its coverage meter above the wait. */
export const WithMeter: Story = {
  args: {
    line: 'Checking how much of that was you…',
    above: <StrengthMeter fill={50} label="Scoring what you said unaided" />,
  },
}
