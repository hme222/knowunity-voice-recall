import { redirect } from 'next/navigation'

// The link opens on the prototype brief again (designer, 2026-10-13: "bring back a first
// page explaining the prototype, then go to Say It Back unlocked"). Its Start goes to
// home with the unlock popup. It opened straight on /home/unlock from 2026-10-12.
export default function RootPage() {
  redirect('/start')
}
