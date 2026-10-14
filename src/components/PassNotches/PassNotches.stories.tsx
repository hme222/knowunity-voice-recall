import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { PassNotches } from './PassNotches'

const DESCRIPTION = `
**WHAT:** How strong a term is, in unaided passes: five notches, one per unaided pass, never dropping.

**WHEN:** In the footer of the Pass RecallResult (04 Pass), via its \`footer\` slot. Today's notch is ringed when this pass added it.

**DON'T:** Don't use it for the drill's coverage — that is StrengthMeter, a continuous bar. Don't let it drop: help, a miss or a reveal never removes a notch. The long-run count is mocked in the prototype (Term.unaidedBefore).
`

const meta = {
  title: 'Components/PassNotches',
  component: PassNotches,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: { filled: 3, fresh: true },
  decorators: [(Story) => <div style={{ width: 'calc(358 * var(--size-primitive-unit))', padding: 'calc(var(--spacing-semantic-card-padding) * var(--size-primitive-unit))', background: 'var(--color-semantic-background-surface)' }}><Story /></div>],
} satisfies Meta<typeof PassNotches>

export default meta
type Story = StoryObj<typeof meta>

export const TodayAddedOne: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img')).toHaveAccessibleName('Strength: 3 of 5 unaided, one more today')
  },
}

/** A hinted pass: shown, nothing added. */
export const NothingNew: Story = { args: { filled: 2, fresh: false } }

export const Full: Story = { args: { filled: 5, fresh: true } }
