import { Fragment } from 'react'
import { statsFor } from '../noteStatus'
import type { Bar, Notes, Whisky, WhiskyNote } from '../types'
import { StatusCounts } from './StatusCounts'
import { WhiskyRow } from './WhiskyRow'

interface Props {
  bar: Bar
  whiskies: Whisky[]
  /** Whiskyen som fremheves (kommer fra en lenke) */
  highlightId?: string
  notes: Notes
  onUpdate: (id: string, patch: Partial<WhiskyNote>) => void
}

export function BarCard({ bar, whiskies, notes, onUpdate, highlightId }: Props) {
  const stats = statsFor(bar.whiskies, notes)

  return (
    <section id={bar.id}>
      <header className="flex items-center justify-between gap-3 px-1 pb-2.5">
        <div className="min-w-0">
          <p className="text-xs text-malt-300">{bar.distributor !== bar.name ? bar.distributor : `${bar.whiskies.length} whisky`}</p>
          {bar.distributor !== bar.name && <p className="text-xs text-malt-500">{bar.whiskies.length} whisky</p>}
        </div>
        <StatusCounts stats={stats} row />
      </header>
      <ul className="space-y-2.5">
        {whiskies.map((w, i) => (
          <Fragment key={w.id}>
            {w.section && w.section !== whiskies[i - 1]?.section && (
              <li className="px-1 pt-4 pb-0.5 font-display text-sm text-amber-200/80 italic">{w.section}</li>
            )}
            <WhiskyRow whisky={w} note={notes[w.id]} onUpdate={(patch) => onUpdate(w.id, patch)} highlight={w.id === highlightId} />
          </Fragment>
        ))}
      </ul>
    </section>
  )
}
