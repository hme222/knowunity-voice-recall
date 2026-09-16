import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OPTION_ROW_STATES, OptionRow } from './OptionRow'

// Verbatim from the Figma component description (optionRow, 15651:10687).
const FIGMA_DESCRIPTION = `
**WHAT:** A single answer row, one variant property state (Default/Selected/Correct/Incorrect), one text property label for the answer copy.

**WHEN:** One row per multiple-choice option in a recall question. Verdict colors (Correct/Incorrect) apply only after the student commits an answer.

**DON'T:** Don't show Correct/Incorrect as a live preview while the student is still choosing. Don't treat it as finished: state is color-only right now, no shape or icon signal, and the single state property can't represent an option that was correct but wasn't the one selected. Both gaps are real and disclosed, not hidden.

---

Built 2026-09-16. Fully bound in Figma except its fixed 56 height, which is exactly the content (Body M line-height + cardPadding), so nothing was added.
`

const meta = {
  title: 'Components/OptionRow',
  component: OptionRow,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { state: { control: 'radio', options: OPTION_ROW_STATES } },
  args: { label: '320 km', state: 'Default' },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof OptionRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Selected: Story = { args: { state: 'Selected' } }
export const Correct: Story = { args: { state: 'Correct' } }
export const Incorrect: Story = { args: { state: 'Incorrect' } }
export const AnswerList: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 'calc(var(--size-primitive-space-200) * 1px)' }}>
      <OptionRow label="160 km" />
      <OptionRow label="320 km" state="Selected" />
      <OptionRow label="640 km" />
    </div>
  ),
}
