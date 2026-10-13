import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MicButton } from '../MicButton/MicButton'
import { micRegionClass } from '../ScreenShell/ScreenShell'
import { MicCaption } from './MicCaption'

const DESCRIPTION = `
**WHAT:** A caption pinned under the mic: an optional label ("Hint") over one or two lines of body. No card.

**WHEN:** On an idle voice screen, when something about the mic needs saying where the student's eyes already are — a retry hint on 01 Idle, or "Tap to answer" on the doors. It sits in the bottom 80 of the mic region, the space 02 Recording uses for its status.

**DON'T:** Don't put it in middleContent; it belongs inside the \`micRegionClass\` wrapper, after the \`MicButton\`. Don't use it on a recording screen — that space is \`RecordingStatus\`'s. Don't run it past two lines; the region has 80 for it.

---

No Figma counterpart. Promoted 2026-10-07 from three inline copies (01 Idle hint, chat door, exam-plan door). Format locked by the designer the same day.
`

const meta = {
  title: 'Components/MicCaption',
  component: MicCaption,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: { label: 'Hint', body: 'Some ways cost the cell energy. Some do not.' },
  // Shown in place: inside a mic region at the 390 frame width, under an idle mic.
  decorators: [
    (Story) => (
      <div style={{ width: 'calc(var(--responsive-primitive-device-width-mobile) * var(--size-primitive-unit))' }}>
        <div className={micRegionClass}>
          <MicButton state="Idle" />
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof MicCaption>

export default meta
type Story = StoryObj<typeof meta>

export const Hint: Story = {}

export const HintTwoLines: Story = {
  args: { body: 'Think about what the two atoms do with their electrons, and what holds them.' },
}

export const Caption: Story = {
  args: { label: undefined, body: 'Tap to answer' },
}
