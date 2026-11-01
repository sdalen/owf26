import { useEffect, useState } from 'react'
import { now } from '../clock'
import { allWhiskies } from '../data/lookup'
import { wishOf } from '../noteStatus'
import { PIT_STOPS } from '../data/pitStops'
import { hasPitStopBong } from '../pitStopBongs'
import type { Notes, PitStopDay } from '../types'
import { href } from '../useRoute'

/** Varselet dukker opp så lenge før pit-stop starter */
const SHOW_BEFORE_MS = 30 * 60 * 1000

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

interface BannerProps {
  notes: Notes
  ticketDays: number
  usedPitStopBongs: PitStopDay[]
}

export function PitStopBanner({ notes, ticketDays, usedPitStopBongs }: BannerProps) {
  const pitStop = usePitStop()
  if (!pitStop) return null

  const { drams, mine } = pitStopDrams(pitStop.day, notes)
  const others = drams.filter((w) => !mine.includes(w))

  return (
    <section className={`pit-${pitStop.day} rounded-xl border p-4 ${pitStop.live ? 'border-pit-400 bg-pit-500/20' : 'border-pit-400/60 bg-pit-500/10'}`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-pit-200 uppercase">Pit-stop {pitStop.label}</p>
          <h2 className="text-lg font-semibold text-pit-50">{pitStop.live ? 'Pågår nå! Slutter om' : 'Starter om'}</h2>
        </div>
        <p className="font-mono text-4xl font-bold tabular-nums text-pit-100" aria-live="off">
          {pitStop.countdown}
        </p>
      </div>

      {/* Kun visning – bongen brukes automatisk når du markerer en pit-stop-dram som smakt */}
      {hasPitStopBong(pitStop.day, ticketDays, usedPitStopBongs) && (
        <p className={`mt-3 rounded-xl px-3 py-2.5 text-sm ${usedPitStopBongs.includes(pitStop.day) ? 'bg-pit-400/10 text-pit-200/80' : 'bg-pit-400/20 font-semibold text-pit-50'}`}>
          {usedPitStopBongs.includes(pitStop.day)
            ? '✓ Pit-stop-bongen er brukt'
            : 'Du har en ubrukt pit-stop-bong – den brukes når du markerer en pit-stop-dram som smakt'}
        </p>
      )}

      {mine.length > 0 ? (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-amber-300">På lista di ({mine.length})</h3>
          <ul className="space-y-2">
            {mine.map((w) => {
              const tasted = !!notes[w.id]?.tasted
              return (
                <li key={w.id}>
                  <a
                    href={href({ view: 'bar', barId: w.bar.id, whiskyId: w.id })}
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
        <p className="mt-2 text-sm text-pit-200/80">Ingen pit-stop-drammer på lista di – her er alle:</p>
      )}

      <details className="mt-3 text-sm" open={mine.length === 0}>
        <summary className="cursor-pointer text-pit-200 hover:text-pit-100">
          {mine.length > 0 ? `Alle pit-stop-drammer (${drams.length})` : `${drams.length} pit-stop-drammer`}
        </summary>
        <ul className="mt-2 space-y-1">
          {(mine.length > 0 ? others : drams).map((w) => (
            <li key={w.id}>
              <a href={href({ view: 'bar', barId: w.bar.id, whiskyId: w.id })} className="flex justify-between gap-3 text-malt-100 hover:text-pit-100">
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
      className={`pit-${pitStop.day} -mx-4 flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium ${pitStop.live ? 'bg-pit-500 text-malt-950' : 'bg-pit-500/25 text-pit-100'}`}
    >
      <span>
        Pit-stop {pitStop.live ? 'pågår – slutter om' : 'om'} <span className="font-mono tabular-nums">{pitStop.countdown}</span>
        {left.length > 0 && ` · ${left.length} på lista di`}
      </span>
      <span aria-hidden>›</span>
    </a>
  )
}
