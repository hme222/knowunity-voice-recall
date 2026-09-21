import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AppBar } from '../AppBar/AppBar'
import { Button } from '../Button/Button'
import { ChatBubble } from '../ChatBubble/ChatBubble'
import { ProgressIndicator } from '../ProgressIndicator/ProgressIndicator'
import { ScreenShell } from './ScreenShell'

const FIGMA_DESCRIPTION = `
**WHAT:** The React counterpart of the Figma \`scaffold\` component set (variant \`size=iPhone 13\`). Four fixed chrome regions — Panel Header 48, topNavigation 56, bottomContent 120, bottomSheetOnly 34 — with middleContent flexing to fill the remainder. At an 844-tall viewport the middle computes to 620 and matches the frames exactly; at any other height the middle absorbs the difference so the shell never scrolls itself.

**WHEN:** Every screen. Screens fill the slots and write no layout values of their own. Heights come from \`component.scaffold.*\`; padding and gaps from \`screenMargin\`, \`space.200\` and \`space.100\`.

**DON'T:** Don't reproduce the scaffold's \`showBottomSheetBackground\` toggle. A sheet lives on its own branch screen — baking one into a default-state screen has caused bugs three times in the Figma file. Don't put the AppBar inside the shell either: home and picker have no app bar and use the same shell unchanged.

---

Built 2026-09-20. \`flex: 1\` on the middle region is a sanctioned exception to the no-literals rule — see SPEC.md § Conventions.
`

const meta = {
  title: 'Components/ScreenShell',
  component: ScreenShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: { topNavigation: { control: false }, bottomContent: { control: false }, bottomSheetOnly: { control: false } },
} satisfies Meta<typeof ScreenShell>

export default meta
type Story = StoryObj<typeof meta>

export const SessionScreen: Story = {
  name: 'Session screen',
  args: {
    topNavigation: (
      <AppBar variant="leftIconButtonOnly">
        <ProgressIndicator progress="25" thickness="16" label="Questions" current={1} total={4} />
      </AppBar>
    ),
    children: <ChatBubble showTitle title="Explain: Formal charge" body="Say what formal charge means, in your own words." />,
    bottomContent: <Button CTA="Let's go" variant="Primary" size="M" fullWidth />,
  },
}

export const NoTopNavigation: Story = {
  name: 'No app bar (home, picker)',
  args: {
    children: <ChatBubble body="Home and the picker have no app bar and use the same shell unchanged." />,
  },
}
