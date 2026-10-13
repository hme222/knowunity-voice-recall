import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent } from 'storybook/test'
import { TextInput, TEXT_INPUT_VARIANTS } from './TextInput'

const DESCRIPTION = `
**WHAT:** The one typed-input field. \`single\` is a one-line pill (the picker's search); \`multi\` is the typed answer box on /text/turn.

**WHEN:** Any time the student types. Promoted 2026-10-13 from two inline copies, per component-gaps.md.

**DON'T:** Don't rely on the placeholder as the label — pass \`label\`, which is the accessible name. Don't restyle it per screen; the two variants are the only shapes.
`

const meta = {
  title: 'Components/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  argTypes: { variant: { control: 'radio', options: TEXT_INPUT_VARIANTS } },
  args: { label: 'Search your topics', placeholder: 'Search your topics', value: '', onChange: () => {} },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <TextInput {...args} value={value} onChange={setValue} />
  },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * var(--size-primitive-unit))' }}><Story /></div>],
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: { type: 'search' },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('searchbox', { name: 'Search your topics' })
    await userEvent.type(field, 'bond')
    await expect(field).toHaveValue('bond')
  },
}

export const Multi: Story = {
  args: { variant: 'multi', label: 'Your answer', placeholder: 'Type your answer…' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Your answer' }).tagName).toBe('TEXTAREA')
  },
}
