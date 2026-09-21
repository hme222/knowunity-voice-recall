import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AppBar } from '../AppBar/AppBar'
import { BottomSheet } from '../BottomSheet/BottomSheet'
import { Button } from '../Button/Button'
import { ChatBubble } from '../ChatBubble/ChatBubble'
import { MascotSlot } from '../MascotSlot/MascotSlot'
import { MicButton } from '../MicButton/MicButton'
import { PickerRow } from '../PickerRow/PickerRow'
import { ProgressIndicator } from '../ProgressIndicator/ProgressIndicator'
import { SessionFraction } from '../SessionFraction/SessionFraction'
import { CloseIcon } from '../icons'
import { ScreenShell } from './ScreenShell'

const FIGMA_DESCRIPTION = `
**WHAT:** The React counterpart of the Figma \`scaffold\` component set (variant \`size=iPhone 13\`). Four fixed chrome regions — Panel Header 48, topNavigation 56, bottomContent 120, bottomSheetOnly 34 — with middleContent flexing to fill the remainder. At an 844-tall viewport the middle computes to 620 and matches the frames; at any other height the middle absorbs the difference so the shell never scrolls itself.

**WHEN:** Every screen. Screens fill the slots and write no layout values of their own. Heights come from \`component.scaffold.*\`; padding and gaps from \`screenMargin\`, \`space.200\` and \`space.100\`.

**The three booleans mirror Figma's own toggles.** Per \`docs/design-system.md\`: "These control visibility, they don't remove the underlying slot" — a region that is on still reserves its height when empty, which is what keeps the action zone in the same place from screen to screen. One divergence: Figma defaults \`showTopNavSlot\`/\`showBottomNavSlot\` to true on every instance, whereas here they default to whether content was passed, so home and the picker don't reserve 56px of nothing. Pass \`true\` explicitly for Figma's behaviour.

**DON'T:** \`showBottomSheetBackground\` marks a screen as a sheet *branch*, not a default state. \`docs/sprint-context.md\` § "Process notes" records three occasions where a sheet was baked into a screen meant to show a normal state, and says to check any screen using this flag specifically. Code can't enforce a routing rule — if the flag is on, that route should exist only to show the sheet. Don't put the AppBar inside the shell either: home and picker have no app bar and use the same shell unchanged.

---

Built 2026-09-20; toggles added 2026-09-20 after a frame comparison found them missing. \`flex: 1\` on the middle region is a sanctioned exception to the no-literals rule — see SPEC.md § Conventions.
`

const meta = {
  title: 'Components/ScreenShell',
  component: ScreenShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    topNavigation: { control: false },
    bottomContent: { control: false },
    bottomSheetOnly: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof ScreenShell>

export default meta
type Story = StoryObj<typeof meta>

/** Everything 01 Idle puts in each slot, in the slot the frame puts it in. */
const idleTopNav = (
  <>
    <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave">
      <ProgressIndicator progress="25" thickness="16" label="Questions" current={1} total={4} />
    </AppBar>
    <SessionFraction current={1} total={4} />
  </>
)

export const IdleScreen: Story = {
  name: '01 Idle — as the frame builds it',
  args: {
    topNavigation: idleTopNav,
    children: (
      <>
        <ChatBubble
          showTitle
          title="Explain: Formal charge"
          body="Say what formal charge means, in your own words. However you'd explain it to a friend."
        />
        <MascotSlot size="2XL" expression="determined" />
        {/* The frame puts micButton in middleContent, not the action zone. */}
        <MicButton state="Idle" />
      </>
    ),
    bottomContent: (
      <>
        <Button CTA="Type instead" variant="Secondary" size="M" fullWidth />
        <Button CTA="Skip" variant="Tertiary" size="M" fullWidth />
      </>
    ),
  },
}

export const NoTopNavigation: Story = {
  name: 'No app bar (home, picker)',
  args: {
    children: <ChatBubble body="Home and the picker have no app bar and use the same shell unchanged." />,
  },
}

export const ReservedEmptyTopNav: Story = {
  name: 'showTopNavSlot — reserved but empty',
  args: {
    showTopNavSlot: true,
    children: <ChatBubble body="The region still takes its 56px with nothing in it, as Figma's toggle does — so the action zone stays put between screens." />,
    bottomContent: <Button CTA="Continue" variant="Primary" size="M" fullWidth />,
  },
}

export const NoBottomNav: Story = {
  name: 'showBottomNavSlot=false',
  args: {
    topNavigation: idleTopNav,
    showBottomNavSlot: false,
    children: <ChatBubble body="No action zone at all — the middle takes the height back." />,
  },
}

export const SheetBranch: Story = {
  name: 'showBottomSheetBackground — a sheet branch',
  args: {
    topNavigation: idleTopNav,
    children: <ChatBubble showTitle title="Explain: Formal charge" body="The screen behind the sheet, dimmed by the scrim." />,
    showBottomSheetBackground: true,
    bottomSheetOnly: (
      <BottomSheet Title="All your takes" subtitle="Every round you just did, in order.">
        <PickerRow raised variant="drill" label="Round 1 · Full definition" state="sharp" />
        <PickerRow raised variant="drill" label="Round 2 · All you" state="sharp" />
      </BottomSheet>
    ),
  },
}
