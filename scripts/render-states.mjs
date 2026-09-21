// Renders every screen state at 390×844 in dark mode and hashes the result.
// Two states that should differ but hash identically are the finding: one of them is
// broken or was never rendered. This flags; it does not fix.
import { chromium } from 'playwright'
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'

const BASE = 'http://localhost:3000'

// name, route, and an optional action to reach a sub-state that has no route of its own.
/** Writes a resolved requeue, so 06b's two branches can be told apart. */
const seedRequeue = (bucket) => async (page) => {
  await page.evaluate(
    (b) =>
      sessionStorage.setItem(
        'sayitback.session',
        JSON.stringify({ outcomes: [{ index: 1, bucket: b, xp: b === 'Unaided' ? 10 : 0, requeued: true }], startedAt: Date.now(), lastAt: Date.now() }),
      ),
    bucket,
  )
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(350)
}

/** Writes the confidence tap 03 Processing would have stored, then reloads. */
const seedTap = (index, wasSure, right) => async (page) => {
  await page.evaluate(
    (v) =>
      sessionStorage.setItem(
        'sayitback.session',
        JSON.stringify({ outcomes: [], startedAt: Date.now(), lastAt: Date.now(), confidence: { [v.index]: { wasSure: v.wasSure, right: v.right } } }),
      ),
    { index, wasSure, right },
  )
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(350)
}

const STATES = [
  ['door-quiz', '/'],
  ['door-quiz-result', '/door/quiz/result'],
  ['door-exam-plan', '/door/exam-plan'],
  ['door-chat', '/door/chat'],
  ['home-prelock', '/home'],
  ['home-unlock-reveal', '/home/unlock'],
  ['home-unlocked', '/home/unlocked'],
  ['home-due-swipe1', '/home/due'],
  ['home-due-swipe2', '/home/due', async p => { await p.getByText('Swipe to the next').click(); await p.waitForTimeout(400) }],
  ['home-due-swipe3', '/home/due', async p => { for (let i = 0; i < 2; i++) { await p.getByText('Swipe to the next').click(); await p.waitForTimeout(400) } }],
  ['picker', '/picker'],
  ['00-intro', '/session/intro'],
  ['01-idle-t1', '/session/idle/1'],
  ['01-idle-t2', '/session/idle/2'],
  ['01-idle-t4-last', '/session/idle/4'],
  ['01b-exit', '/session/exit'],
  ['02-recording', '/session/recording/1'],
  ['02-recording-paused', '/session/recording/1', async p => { await p.getByRole('button', { name: /listening/i }).click(); await p.waitForTimeout(400) }],
  ['02a-captured', '/session/captured/1?ms=6000&attempt=1'],
  ['03-processing', '/session/processing/1?ms=6000&attempt=1'],
  ['03-processing-escalated', '/session/processing/1?ms=6000&attempt=1', async p => { await p.waitForTimeout(7000) }],
  ['04-pass', '/session/pass/1?sure=1&attempt=1'],
  ['04-pass-hinted', '/session/pass/1?sure=1&attempt=2&hinted=1'],
  ['04a-unclear', '/session/unclear/1?attempt=1'],
  ['05-miss', '/session/miss/1?attempt=1'],
  ['05a-reveal', '/session/reveal/1'],
  ['repeat', '/session/repeat/1'],
  ['06-lockin', '/session/lock-in'],
  ['06b-lockin-second-skipped', '/session/lock-in/second', seedRequeue('Worth revisiting')],
  ['06b-lockin-second-answered', '/session/lock-in/second?answered=1', seedRequeue('Unaided')],
  ['07-recap', '/session/recap'],
  ['07a-practice', '/session/recap/practice'],
  ['blank-term', '/session/blank/1'],
  ['offline', '/session/offline?term=1'],
  ['resume', '/session/resume'],
  ['transcript-passed-t1', '/session/transcript/passed?term=1'],
  ['transcript-passed-t3', '/session/transcript/passed?term=3'],
  ['transcript-revealed', '/session/transcript/revealed'],
  ['transcript-skipped', '/session/transcript/skipped'],
  ['permission-primer', '/permission/primer'],
  ['permission-prompt', '/permission/prompt'],
  ['permission-denied', '/permission/denied'],
  ['permission-denied-expanded', '/permission/denied', async p => { await p.getByText('How to turn the mic on').click(); await p.waitForTimeout(300) }],
  ['text-turn', '/text/turn?term=1'],
  ['text-checking', '/text/checking?term=1&len=50'],
  ['dd00-intro', '/drill/intro'],
  ['dd00b-intro-returning', '/drill/intro?returning=1'],
  ['dd01-rung1', '/drill/pass/1'],
  ['dd04-rung2', '/drill/pass/2'],
  ['dd05-rung3', '/drill/pass/3'],
  ['dd06-rung4', '/drill/pass/4'],
  ['dd02-recording', '/drill/recording?step=1'],
  ['dd02a-captured', '/drill/captured?step=1'],
  ['dd03-processing', '/drill/processing?step=1'],
  ['dd07-stumble1', '/drill/miss'],
  ['dd07b-stumble2', '/drill/miss/letter'],
  ['dd07c-stumble3', '/drill/miss/echo'],
  ['dd08-complete', '/drill/complete'],
  ['dd08a-round-sheet', '/drill/complete/round'],
  // Query-parameter variants. The 03 pass rendered 59 states and reported "no
  // collisions", which was the wrong test: it never varied a query param, and every
  // collision the panel found lived there. These are the states that differ only by URL.
  // These four differ by a tap STORED in sessionStorage, not by the URL. Without
  // seeding it the pair renders identically and the harness reports a false collision
  // — which is what happened on the first run of this list.
  ['04-pass-sure', '/session/pass/2?sure=1&attempt=1', seedTap(2, true, true)],
  ['04-pass-unsure', '/session/pass/2?sure=0&attempt=1', seedTap(2, false, true)],
  ['05-miss-sure', '/session/miss/2?sure=1&attempt=1', seedTap(2, true, false)],
  ['05-miss-unsure', '/session/miss/2?sure=0&attempt=1', seedTap(2, false, false)],
  ['05-miss-attempt2', '/session/miss/1?attempt=2&sure=0'],
  ['05-miss-attempt3-no-retry', '/session/miss/1?attempt=3&sure=0'],
  ['04a-unclear-attempt2', '/session/unclear/1?attempt=2'],
  ['text-turn-sticky', '/text/turn?term=1&sticky=1'],
  ['text-turn-drill', '/text/turn?term=1&drill=2'],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  colorScheme: 'dark',
  deviceScaleFactor: 2,
  reducedMotion: 'reduce', // freeze animation so a hash is stable, not a moving target
})
const page = await ctx.newPage()
const results = []

for (const [name, route, action] of STATES) {
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(350)
    if (action) await action(page)
    const buf = await page.screenshot({ path: `eval/shots/${name}.png` })
    results.push({ name, route, hash: createHash('sha256').update(buf).digest('hex').slice(0, 16) })
    process.stdout.write('.')
  } catch (e) {
    results.push({ name, route, hash: 'ERROR', error: String(e).split('\n')[0].slice(0, 120) })
    process.stdout.write('x')
  }
}
await browser.close()
console.log('\n')

writeFileSync('eval/shots/hashes.json', JSON.stringify(results, null, 1))

const errs = results.filter(r => r.hash === 'ERROR')
if (errs.length) {
  console.log('COULD NOT RENDER:')
  for (const e of errs) console.log(`  ${e.name}  ${e.route}\n    ${e.error}`)
  console.log('')
}

const byHash = new Map()
for (const r of results) {
  if (r.hash === 'ERROR') continue
  if (!byHash.has(r.hash)) byHash.set(r.hash, [])
  byHash.get(r.hash).push(r)
}
const collisions = [...byHash.values()].filter(g => g.length > 1)
if (collisions.length) {
  console.log('IDENTICAL RENDERS — these states should differ:')
  for (const g of collisions) console.log('  ' + g.map(r => `${r.name} (${r.route})`).join('\n  === ') + '\n')
} else {
  console.log('No two states rendered identically.')
}
console.log(`rendered ${results.length - errs.length}/${results.length}`)
