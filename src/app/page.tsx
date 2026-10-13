import { redirect } from 'next/navigation'

// The link opens on home with the "Say It Back feature unlocked" popup (designer,
// 2026-10-12: "the home/unlock screen should start everything"). Its chip goes to
// 00 Intro, the second screen. The prototype brief that used to be here is at /start.
export default function RootPage() {
  redirect('/home/unlock')
}
