import { Fragment, useState } from 'react'
import { statsFor, wishOf } from '../noteStatus'
import { matchesStatus, useStatusFilter } from '../statusFilter'
import type { Bar, Notes, Whisky, WhiskyNote } from '../types'
import { StatusCounts } from './StatusCounts'
import { StatusFilterBar } from './StatusFilter'
import { WhiskyRow } from './WhiskyRow'

interface Props {
  bar: Bar
  whiskies: Whisky[]
  /** Whiskyen som fremheves (kommer fra en lenke) */
  highlightId?: string
  notes: Notes
  onUpdate: (id: string, patch: Partial<WhiskyNote>) => void
}

/** Må smake øverst, så kanskje, så resten – smakte nederst */
function rank(note: WhiskyNote | undefined): number {
  if (note?.tasted) return 3
  const wish = wishOf(note)
  return wish === 'must' ? 0 : wish === 'maybe' ? 1 : 2
}

/** Sorterer innenfor hver seksjon og beholder seksjonenes rekkefølge */
function sortForBar(whiskies: Whisky[], notes: Notes): Whisky[] {
  const sectionOrder = [...new Set(whiskies.map((w) => w.section))]
  return [...whiskies].sort((a, b) => sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section) || rank(notes[a.id]) - rank(notes[b.id]))
}

export function BarCard({ bar, whiskies, notes, onUpdate, highlightId }: Props) {
  const stats = statsFor(bar.whiskies, notes)
  // Rekkefølgen låses når baren åpnes, så kortet ikke hopper vekk når du trykker smakt/må smake
  const [order] = useState(() => sortForBar(whiskies, notes).map((w) => w.id))
  const byId = new Map(whiskies.map((w) => [w.id, w]))
  // Ingen avhuking betyr hele baren; ellers bare det som er huket av
  const [filter, toggleFilter] = useStatusFilter('owf26-bar-filter', { must: false, maybe: false, tasted: false })
  const filtering = filter.must || filter.maybe || filter.tasted
  const sorted = order.map((id) => byId.get(id)!).filter((w) => !filtering || matchesStatus(notes[w.id], filter))

  return (
    <section id={bar.id}>
      <header className="flex items-center justify-between gap-3 px-1 pb-2.5">
        <div className="min-w-0">
          <p className="text-xs text-malt-300">{bar.distributor !== bar.name ? bar.distributor : `${bar.whiskies.length} whisky`}</p>
          {bar.distributor !== bar.name && <p className="text-xs text-malt-500">{bar.whiskies.length} whisky</p>}
        </div>
        <StatusCounts stats={stats} row />
      </header>
      <StatusFilterBar filter={filter} onToggle={toggleFilter} className="mb-3 px-1" />
      {sorted.length === 0 && <p className="py-12 text-center text-malt-300">Ingenting å vise med disse valgene.</p>}
      <ul className="space-y-2.5">
        {sorted.map((w, i) => (
          <Fragment key={w.id}>
            {w.section && w.section !== sorted[i - 1]?.section && (
              <li className="px-1 pt-4 pb-0.5 font-display text-sm text-amber-200/80 italic">{w.section}</li>
            )}
            <WhiskyRow whisky={w} note={notes[w.id]} onUpdate={(patch) => onUpdate(w.id, patch)} highlight={w.id === highlightId} />
          </Fragment>
        ))}
      </ul>
    </section>
  )
}
