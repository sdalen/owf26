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

/** Varselet dukker opp så lenge før pit-stop starter */
const SHOW_BEFORE_MS = 30 * 60 * 1000

// ?tid=2026-11-06T18:28 starter klokka på det tidspunktet og lar den gå videre – for å teste varselet
const clockOffset = (() => {
  const override = new URLSearchParams(window.location.search).get('tid')
  const t = override ? new Date(`${override}+01:00`).getTime() : NaN
  return Number.isNaN(t) ? 0 : t - Date.now()
})()

function now(): Date {
  return new Date(Date.now() + clockOffset)
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function usePitStop() {
  const [time, setTime] = useState(now)

  useEffect(() => {
    const id = setInterval(() => setTime(now()), 1000)
    return () => clearInterval(id)
  }, [])

  const current = PIT_STOPS.find((p) => time.getTime() >= p.start.getTime() - SHOW_BEFORE_MS && time < p.end)
  if (!current) return null
  const live = time >= current.start
  return { ...current, live, countdown: formatCountdown((live ? current.end : current.start).getTime() - time.getTime()) }
}

function pitStopDrams(day: PitStopDay, notes: Notes) {
  const drams = allWhiskies.filter((w) => w.pitStop?.includes(day))
  return { drams, mine: drams.filter((w) => wishOf(notes[w.id])) }
}

export function PitStopBanner({ notes }: { notes: Notes }) {
  const pitStop = usePitStop()
  if (!pitStop) return null

  const { drams, mine } = pitStopDrams(pitStop.day, notes)
  const others = drams.filter((w) => !mine.includes(w))

  return (
    <section className={`rounded-xl border p-4 ${pitStop.live ? 'border-sky-400 bg-sky-500/20' : 'border-sky-400/60 bg-sky-500/10'}`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-sky-200 uppercase">Pit-stop {pitStop.label}</p>
          <h2 className="text-lg font-semibold text-sky-50">{pitStop.live ? 'Pågår nå! Slutter om' : 'Starter om'}</h2>
        </div>
        <p className="font-mono text-4xl font-bold tabular-nums text-sky-100" aria-live="off">
          {pitStop.countdown}
        </p>
      </div>

      {mine.length > 0 ? (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-amber-300">På lista di ({mine.length})</h3>
          <ul className="space-y-2">
            {mine.map((w) => {
              const tasted = !!notes[w.id]?.tasted
              return (
                <li key={w.id}>
                  <a
                    href={href({ view: 'bar', barId: w.bar.id })}
                    className={`block rounded-lg border px-3 py-2 ${tasted ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-amber-400/60 bg-amber-400/15 hover:bg-amber-400/25'}`}
                  >
                    <p className="font-semibold text-malt-50">
                      {tasted ? '✓ ' : wishOf(notes[w.id]) === 'must' ? '♥ ' : '? '}
                      {w.name}
                    </p>
                    <p className="text-sm text-malt-100">
                      <span className="font-medium">{w.bar.name}</span>
                      <span className="text-malt-300">
                        {' '}
                        · {w.bar.floor}. etasje · {w.bonger} {w.bonger === 1 ? 'bong' : 'bonger'}
                      </span>
                    </p>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-sm text-sky-200/80">Ingen pit-stop-drammer på lista di – her er alle:</p>
      )}

      <details className="mt-3 text-sm" open={mine.length === 0}>
        <summary className="cursor-pointer text-sky-200 hover:text-sky-100">
          {mine.length > 0 ? `Alle pit-stop-drammer (${drams.length})` : `${drams.length} pit-stop-drammer`}
        </summary>
        <ul className="mt-2 space-y-1">
          {(mine.length > 0 ? others : drams).map((w) => (
            <li key={w.id}>
              <a href={href({ view: 'bar', barId: w.bar.id })} className="flex justify-between gap-3 text-malt-100 hover:text-sky-100">
                <span>{w.name}</span>
                <span className="shrink-0 text-malt-300">
                  {w.bar.name} · {w.bar.floor}. etg
                </span>
              </a>
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}

/** Kompakt stripe øverst på de andre skjermene, så varselet ikke går tapt mens man er inne i en bar */
export function PitStopStrip({ notes }: { notes: Notes }) {
  const pitStop = usePitStop()
  if (!pitStop) return null
  const { mine } = pitStopDrams(pitStop.day, notes)
  const left = mine.filter((w) => !notes[w.id]?.tasted)

  return (
    <a
      href={href({ view: 'home' })}
      className={`-mx-4 flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium ${pitStop.live ? 'bg-sky-500 text-malt-950' : 'bg-sky-500/25 text-sky-100'}`}
    >
      <span>
        Pit-stop {pitStop.live ? 'pågår – slutter om' : 'om'} <span className="font-mono tabular-nums">{pitStop.countdown}</span>
        {left.length > 0 && ` · ${left.length} på lista di`}
      </span>
      <span aria-hidden>›</span>
    </a>
  )
}
