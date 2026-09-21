import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PickerRow } from '../PickerRow/PickerRow'
import { BottomSheet } from './BottomSheet'

const DESCRIPTION = `
**WHAT:** The shared bottom-sheet shell: scrim, grabber, title, optional subtitle, content area. \`Title\` is the Figma text property.

**WHEN:** The transcript sheet (from the Miss result's eye icon and every Recap row) and the drill's round-tapped sheet.

**DON'T — this one carries a rule, not just a shape.** A sheet must live on its **own branch screen** and must never be baked into a screen representing a default state. That has caused bugs three times in the Figma file, which is also why \`ScreenShell\` deliberately does not reproduce the scaffold's \`showBottomSheetBackground\` toggle. Don't put plain \`background.surface\` rows inside it either — they resolve to the sheet's own fill and vanish. Use \`PickerRow raised\`, or \`background.raised\`.

---

Built 2026-09-20. The grabber binds to \`border.strong\`; it was a raw 25% white in Figma.
`

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: DESCRIPTION } } },
  args: { Title: 'All your takes', subtitle: 'Every round you just did, in order.' },
} satisfies Meta<typeof BottomSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <PickerRow raised variant="drill" label="Round 1 · Full definition" state="sharp" />
        <PickerRow raised variant="drill" label="Round 2 · One word gone" state="sharp" />
        <PickerRow raised variant="drill" label="Round 3 · All you" state="sharp" />
      </>
    ),
  },
}

export const TitleOnly: Story = {
  name: 'No subtitle',
  args: { subtitle: undefined, children: <PickerRow raised variant="topic" label="Formal charge" /> },
}
