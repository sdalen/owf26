import { Fragment } from 'react'
import { TopBar } from '../components/TopBar'
import { WhiskyRow } from '../components/WhiskyRow'
import { floors } from '../data/floors'
import { PIT_STOPS } from '../data/pitStops'
import { allWhiskies } from '../data/lookup'
import { statsFor } from '../noteStatus'
import type { Notes, PitStopDay, WhiskyNote } from '../types'
import { href } from '../useRoute'

interface Props {
  day: PitStopDay
  notes: Notes
  onUpdate: (id: string, patch: Partial<WhiskyNote>) => void
}

const time = (d: Date) => d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' })

/** Alle pit-stop-drammene for én dag, gruppert på etasje og bar */
export function PitStopView({ day, notes, onUpdate }: Props) {
  const pitStop = PIT_STOPS.find((p) => p.day === day)!
  // allWhiskies ligger allerede i etasje- og bar-rekkefølge
  const drams = allWhiskies.filter((w) => w.pitStop?.includes(day))
  const stats = statsFor(drams, notes)
  const mine = stats.must + stats.maybe

  return (
    <>
      <TopBar
        title={`Pit-stop ${pitStop.label}`}
        subtitle={`${time(pitStop.start)}–${time(pitStop.end)} · ${drams.length} drammer${mine > 0 ? ` · ${mine} på lista di` : ''}`}
        back={href({ view: 'home' })}
      >
        <div className="flex gap-1 rounded-xl bg-malt-900 p-1 text-sm ring-1 ring-white/5">
          {PIT_STOPS.map((p) => (
            <a
              key={p.day}
              href={href({ view: 'pitstop', day: p.day })}
              aria-current={p.day === day ? 'page' : undefined}
              className={`flex-1 rounded-lg py-1.5 text-center font-semibold ${p.day === day ? 'bg-sky-400/20 text-sky-100' : 'text-malt-300 hover:text-malt-50'}`}
            >
              {p.label[0].toUpperCase() + p.label.slice(1)} {time(p.start)}
            </a>
          ))}
        </div>
      </TopBar>

      <div className="space-y-6">
        {floors.map((f) => {
          const floorDrams = drams.filter((w) => w.bar.floor === f.floor)
          if (floorDrams.length === 0) return null
          return (
            <section key={f.floor}>
              <h2 className="mb-2 px-1 font-display text-lg font-semibold">
                {f.floor}. etasje <span className="font-normal text-malt-300 italic">· {f.name}</span>
              </h2>
              <ul className="card divide-y divide-white/5 overflow-hidden">
                {floorDrams.map((w, i) => (
                  <Fragment key={w.id}>
                    {w.bar.id !== floorDrams[i - 1]?.bar.id && (
                      <li className="bg-malt-950/40 px-4 pt-3 pb-1.5">
                        <a href={href({ view: 'bar', barId: w.bar.id })} className="text-xs font-semibold tracking-wide text-sky-300 uppercase hover:text-sky-200">
                          {w.bar.name} ›
                        </a>
                      </li>
                    )}
                    <WhiskyRow whisky={w} note={notes[w.id]} onUpdate={(patch) => onUpdate(w.id, patch)} />
                  </Fragment>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
