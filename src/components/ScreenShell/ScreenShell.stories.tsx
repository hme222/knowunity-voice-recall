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
import { MicCaption } from '../MicCaption/MicCaption'
import { ScreenShell, micRegionClass } from './ScreenShell'

const FIGMA_DESCRIPTION = `
**WHAT:** The React counterpart of the Figma \`scaffold\` component set (variant \`size=iPhone 13\`). Four fixed chrome regions — Panel Header 48, topNavigation 56, actionZone 136, bottomSheetOnly 34 — with middleContent flexing to fill the remainder. At an 844-tall viewport the middle computes to 570; at any other height the middle absorbs the difference so the shell never scrolls itself.

**WHEN:** Every screen. Screens fill the slots and write no layout values of their own. Heights come from \`component.scaffold.*\`; padding and gaps from \`screenMargin\`, \`space.200\` and \`space.100\`.

**The three booleans mirror Figma's own toggles.** Per \`docs/design-system.md\`: "These control visibility, they don't remove the underlying slot" — a region that is on still reserves its height when empty, which is what keeps the action zone in the same place from screen to screen. One divergence: Figma defaults \`showTopNavSlot\`/\`showBottomNavSlot\` to true on every instance, whereas here they default to whether content was passed, so home and the picker don't reserve 56px of nothing. Pass \`true\` explicitly for Figma's behaviour.

**DON'T:** \`showBottomSheetBackground\` marks a screen as a sheet *branch*, not a default state. \`docs/sprint-context.md\` § "Process notes" records three occasions where a sheet was baked into a screen meant to show a normal state, and says to check any screen using this flag specifically. Code can't enforce a routing rule — if the flag is on, that route should exist only to show the sheet. Don't put the AppBar inside the shell either: home and picker have no app bar and use the same shell unchanged.

---

**The mic slot (\`mic\`), 2026-10-07.** Voice screens pass their \`micRegionClass\` wrapper as \`mic\`, not as a child. It renders between middleContent and the action zone, outside the scroller, so content can never run under the control, and the mic lands at the same height on every voice screen (466 at 390×844).

**Knowie gives way, 2026-10-08.** When middleContent's content would not fit, the shell hides the \`MascotSlot\` (and any wrapper holding only it) before the words have to scroll. Full size or absent — there is no shrunk size. Measured before first paint and again when the webfont lands. See the *Short phone* story. **\`mascotGivesWay={false}\`** opts out, for a screen whose content is meant to scroll (07 Recap's term list).

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
  // The shell is flex: 1 in the app's root layout; here it needs a parent the height
  // of the viewport, or it collapses to its content and nothing ever overflows — which
  // is what hid the give-way from the short-phone story.
  decorators: [
    (Story) => (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    topNavigation: { control: false },
    bottomContent: { control: false },
    bottomSheetOnly: { control: false },
    children: { control: false },
    mic: { control: false },
  },
} satisfies Meta<typeof ScreenShell>

export default meta
type Story = StoryObj<typeof meta>

/** Everything 01 Idle puts in each slot, as the screen builds it now (2026-10-08): Skip
    top right, the fraction under the bar, the mic in its own slot. */
const idleTopNav = (
  <>
    <AppBar variant="leftAndRightButton" leftIcon={<CloseIcon />} leftLabel="Leave" rightText="Skip">
      <ProgressIndicator progress="25" thickness="16" label="Questions" current={1} total={4} />
    </AppBar>
    <SessionFraction current={1} total={4} />
  </>
)

const idleBottom = (
  <>
    <Button CTA="Type instead" variant="Secondary" size="M" fullWidth />
    <Button CTA="I don't know this one" variant="Tertiary" size="S" fullWidth />
  </>
)

/** The screens' own body: a centred column at betweenSections. */
const bodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'calc(var(--spacing-semantic-between-sections) * 1px)',
} as const

const idleBody = (
  <div style={bodyStyle}>
    <MascotSlot size="2XL" expression="excited" />
    <ChatBubble
      showTitle
      title="Explain: "
      titleAccent="Formal charge"
      body="Say what formal charge means, in your own words. However you'd explain it to a friend."
    />
  </div>
)

export const IdleScreen: Story = {
  name: '01 Idle — as the screen builds it',
  args: {
    topNavigation: idleTopNav,
    children: idleBody,
    mic: (
      <div className={micRegionClass}>
        <MicButton state="Idle" />
      </div>
    ),
    bottomContent: idleBottom,
  },
}

export const IdleWithHint: Story = {
  name: '01 Idle, retry after a hint — MicCaption under the mic',
  args: {
    ...IdleScreen.args,
    mic: (
      <div className={micRegionClass}>
        <MicButton state="Idle" />
        <MicCaption label="Hint" body="Think about how the electrons in each bond get divided up." />
      </div>
    ),
  },
}

/** At 390×668 Knowie plus the question do not fit above the mic. The shell takes
    Knowie out so the question is whole, rather than scrolling it under a fade. */
export const ShortPhone: Story = {
  name: 'Short phone (390×668) — Knowie steps out',
  globals: { viewport: { value: 'mobileShort' } },
  args: {
    topNavigation: idleTopNav,
    children: (
      <div style={bodyStyle}>
        <MascotSlot size="2XL" expression="determined" />
        <ChatBubble
          showTitle
          title="Explain: "
          titleAccent="Covalent bond"
          body="Say what a covalent bond is and what holds it together, in your own words. However you would explain it to a friend."
        />
      </div>
    ),
    mic: (
      <div className={micRegionClass}>
        <MicButton state="Idle" />
      </div>
    ),
    bottomContent: idleBottom,
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
