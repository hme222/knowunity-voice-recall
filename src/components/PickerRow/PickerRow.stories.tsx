import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PickerRow, PICKER_ROW_VARIANTS } from './PickerRow'

const DESCRIPTION = `
**WHAT:** A row on the Say It Back picker, with a trailing mic. \`variant="topic"\` opens a full recall session for a topic; \`variant="drill"\` opens Definition Drill Down for one definition and carries a state pill — amber "Worth a drill", green "Keep it sharp".

**WHEN:** The picker. Topic rows offer material the student has revised; drill rows only definitions they have already attempted, so a drill is always about something they have met.

**DON'T:** Don't reach for \`OptionRow\` instead. Its resize bug is fixed, but it still has no slot for a trailing action, so these are not redundant. Don't use \`raised\` outside a sheet — it exists because \`background.surface\` inside a \`bottomSheet\` resolves to the sheet's own fill and the row vanishes.

---

Built 2026-09-20 as one component covering Figma's \`pickerTopicRow\` and \`pickerDrillRow\`, which are the same row differing only in left content.
`

const meta = {
  title: 'Components/PickerRow',
  component: PickerRow,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  argTypes: { variant: { control: 'radio', options: PICKER_ROW_VARIANTS } },
  args: { variant: 'topic', label: 'Chemistry: bonding' },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof PickerRow>

export default meta
type Story = StoryObj<typeof meta>

export const Topic: Story = { args: { variant: 'topic', label: 'Chemistry: bonding' } }
export const DrillWorth: Story = {
  name: 'Drill — worth a drill',
  args: { variant: 'drill', label: 'Formal charge', state: 'drill' },
}
export const DrillSharp: Story = {
  name: 'Drill — keep it sharp',
  args: { variant: 'drill', label: 'Cell membrane', state: 'sharp' },
}
export const Raised: Story = { name: 'On a raised surface', args: { raised: true } }
