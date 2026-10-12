import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AppBar } from '../AppBar/AppBar'
import { ProgressIndicator } from '../ProgressIndicator/ProgressIndicator'
import { CloseIcon } from '../icons'
import { SessionFraction } from './SessionFraction'

const DESCRIPTION = `
**WHAT:** The "N/4" label in the scaffold's \`topNavigation\` slot. **Under the progress bar, left-aligned with its start** (designer, 2026-10-08) — it used to sit on the ring in a page-coloured pill, which read poorly. It fits inside the 56 region, so nothing below moves. Not part of \`appBar\`.

**WHEN:** Every session and drill screen that shows progress. Pair it with a \`ProgressIndicator\` in the same slot — the ring is the visual, this is the count.

**DON'T:** Don't bundle it with \`appBar\` into a session-header component. 07 Recap has an app bar and no fraction, and forcing one would change that screen's design to suit a component. Don't give it its own accessible announcement either — it is \`aria-hidden\` because \`ProgressIndicator\`'s \`label\`/\`current\`/\`total\` already announce the same fact.

---

Built 2026-09-20. Promoted from an inline element on 00 Intro when 01 Idle needed the same thing — two consumers is the bar. See \`component-gaps.md\`.
`

const meta = {
  title: 'Components/SessionFraction',
  component: SessionFraction,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: DESCRIPTION } } },
  args: { current: 1, total: 4 },
  // In place: it is positioned against the top-navigation region, under the bar, so it
  // only reads correctly beside the AppBar and ProgressIndicator it labels.
  decorators: [
    (Story, ctx) => (
      <div style={{ position: 'relative', height: 'calc(var(--component-scaffold-top-navigation-height) * 1px)' }}>
        <AppBar variant="leftAndRightButton" leftIcon={<CloseIcon />} leftLabel="Leave" rightText="Skip">
          <ProgressIndicator
            progress={ctx.args.current === 4 ? '100' : ctx.args.current === 2 ? '50' : '25'}
            thickness="16"
            label="Questions"
            current={ctx.args.current}
            total={ctx.args.total}
          />
        </AppBar>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionFraction>

export default meta
type Story = StoryObj<typeof meta>

export const FirstTerm: Story = { name: '1/4', args: { current: 1, total: 4 } }
export const LastTerm: Story = { name: '4/4', args: { current: 4, total: 4 } }
export const ThreeTermSession: Story = { name: '2/3 — the 3-term case', args: { current: 2, total: 3 } }
