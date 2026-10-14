import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn } from 'storybook/test'
import { ConfidenceAsk } from './ConfidenceAsk'

const DESCRIPTION = `
**WHAT:** The per-term confidence tap — "How sure are you?" over two equal Secondary buttons.

**WHEN:** As an optional toggle (value + onChange) on 02a Captured and the typed check, read when the student confirms the take. In its original form, inside a wait, after the answer is sent and before the verdict lands. It is on 03 Processing and on the typed checking beat; both ask it the same way, which is why it stopped being inline copy on 2026-09-22.

**DON'T:** Don't make one button Primary. They are deliberately equal — promoting either tells the student which answer the app would rather hear, and the whole point is an uncontaminated signal. Don't ask it on a take the app is about to reject.
`

const meta = {
  title: 'Components/ConfidenceAsk',
  component: ConfidenceAsk,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: { onAnswer: fn() },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * var(--size-primitive-unit))' }}><Story /></div>],
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

/** With its optional exit, "Just check it", on the ask's line (02a Captured, typed checking). */
export const WithDecline: Story = {
  args: { onDecline: fn() },
  play: async ({ canvas, args }) => {
    await canvas.getByRole('button', { name: 'Just check it' }).click()
    await expect(args.onDecline).toHaveBeenCalled()
  },
}

/** The typed path asks the same question in its own words. */
export const TypedPath: Story = {
  args: { prompt: 'Before I show you — how did that feel?' },
}

/** Toggle mode (02a Captured, typed check): optional, picked one shows as chosen, a second tap clears it. */
export const Optional: Story = {
  args: { value: true, onChange: fn() },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('button', { name: 'Sure' })).toHaveAttribute('aria-pressed', 'true')
    await canvas.getByRole('button', { name: 'Sure' }).click()
    await expect(args.onChange).toHaveBeenCalledWith(undefined)
    await canvas.getByRole('button', { name: 'Not sure' }).click()
    await expect(args.onChange).toHaveBeenCalledWith(false)
  },
}
