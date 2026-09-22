import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn } from 'storybook/test'
import { ConfidenceAsk } from './ConfidenceAsk'

const DESCRIPTION = `
**WHAT:** The per-term confidence tap — "How sure are you?" over two equal Secondary buttons.

**WHEN:** Inside a wait, after the answer is sent and before the verdict lands. It is on 03 Processing and on the typed checking beat; both ask it the same way, which is why it stopped being inline copy on 2026-09-22.

**DON'T:** Don't make one button Primary. They are deliberately equal — promoting either tells the student which answer the app would rather hear, and the whole point is an uncontaminated signal. Don't ask it on a take the app is about to reject.
`

const meta = {
  title: 'Components/ConfidenceAsk',
  component: ConfidenceAsk,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: { onAnswer: fn() },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof ConfidenceAsk>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await canvas.getByRole('button', { name: 'Sure' }).click()
    await expect(args.onAnswer).toHaveBeenCalledWith(true)
    await canvas.getByRole('button', { name: 'Not sure' }).click()
    await expect(args.onAnswer).toHaveBeenCalledWith(false)
  },
}

/** The typed path asks the same question in its own words. */
export const TypedPath: Story = {
  args: { prompt: 'Before I show you — how did that feel?' },
}
