import { useEffect, useState } from 'react'
import { allWhiskies } from '../data/lookup'
import { wishOf } from '../noteStatus'
import type { Notes, PitStopDay } from '../types'
import { href } from '../useRoute'

// Tidspunkter fra festivalhåndboka (norsk vintertid, UTC+1)
const PIT_STOPS: { day: PitStopDay; label: string; start: Date; end: Date }[] = [
  { day: 'fre', label: 'fredag', start: new Date('2026-11-06T18:30:00+01:00'), end: new Date('2026-11-06T19:00:00+01:00') },
  { day: 'lør', label: 'lørdag', start: new Date('2026-11-07T16:30:00+01:00'), end: new Date('2026-11-07T17:00:00+01:00') },
]

/** Banneret vises fra dette lenge før pit-stop starter */
const SHOW_BEFORE_MS = 4 * 60 * 60 * 1000

function now(): Date {
  // ?tid=2026-11-06T18:00 lar deg teste banneret før festivalen
  const override = new URLSearchParams(window.location.search).get('tid')
  return override ? new Date(`${override}+01:00`) : new Date()
}

function formatCountdown(ms: number): string {
  const minutes = Math.ceil(ms / 60000)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h} t ${m} min` : `${m} min`
}

export function PitStopBanner({ notes }: { notes: Notes }) {
  const [time, setTime] = useState(now)

  useEffect(() => {
    const id = setInterval(() => setTime(now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const current = PIT_STOPS.find((p) => time.getTime() >= p.start.getTime() - SHOW_BEFORE_MS && time < p.end)
  if (!current) return null

  const live = time >= current.start
  const drams = allWhiskies.filter((w) => w.pitStop?.includes(current.day))
  const onList = drams.filter((w) => wishOf(notes[w.id]) && !notes[w.id]?.tasted)

  return (
    <section className={`rounded-xl border p-4 ${live ? 'border-sky-400 bg-sky-500/20' : 'border-sky-400/50 bg-sky-500/10'}`}>
      <h2 className="text-lg font-semibold text-sky-100">
        {live
          ? `Pit-stop pågår nå – til ${current.end.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}!`
          : `Pit-stop ${current.label} om ${formatCountdown(current.start.getTime() - time.getTime())}`}
      </h2>
      <p className="text-sm text-sky-200/80">
        {onList.length > 0 ? `${onList.length} av pit-stop-drammene står på lista di.` : 'Spesielle drammer, kun i en halvtime.'}
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {drams.map((w) => {
          const mine = onList.includes(w)
          return (
            <li key={w.id}>
              <a href={href({ view: 'bar', barId: w.bar.id })} className="flex justify-between gap-3 hover:text-sky-100">
                <span className={mine ? 'font-semibold text-amber-300' : 'text-malt-100'}>
                  {mine && '♥ '}
                  {w.name}
                </span>
                <span className="shrink-0 text-malt-300">
                  {w.bar.name} · {w.bar.floor}. etg
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
