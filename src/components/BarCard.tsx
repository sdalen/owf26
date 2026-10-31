import { Fragment } from 'react'
import type { Bar, Notes, Whisky, WhiskyNote } from '../types'
import { WhiskyRow } from './WhiskyRow'

interface Props {
  bar: Bar
  whiskies: Whisky[]
  notes: Notes
  onUpdate: (id: string, patch: Partial<WhiskyNote>) => void
}

export function BarCard({ bar, whiskies, notes, onUpdate }: Props) {
  const wanted = bar.whiskies.filter((w) => notes[w.id]?.wantToTaste && !notes[w.id]?.tasted).length
  const tasted = bar.whiskies.filter((w) => notes[w.id]?.tasted).length

  return (
    <section id={bar.id} className="overflow-hidden rounded-xl border border-malt-900 bg-malt-900/40">
      <header className="flex items-baseline justify-between gap-3 border-b border-malt-900 bg-malt-900/70 px-4 py-3">
        <div>
          <h3 className="text-lg font-semibold text-malt-50">{bar.name}</h3>
          {bar.distributor !== bar.name && <p className="text-xs text-malt-300">{bar.distributor}</p>}
        </div>
        <p className="shrink-0 text-xs text-malt-300">
          {bar.whiskies.length} whisky
          {wanted > 0 && <span className="text-amber-400"> · {wanted} vil smake</span>}
          {tasted > 0 && <span className="text-emerald-400"> · {tasted} smakt</span>}
        </p>
      </header>
      <ul className="divide-y divide-malt-900">
        {whiskies.map((w, i) => (
          <Fragment key={w.id}>
            {w.section && w.section !== whiskies[i - 1]?.section && (
              <li className="bg-malt-900/30 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-malt-300 italic">{w.section}</li>
            )}
            <WhiskyRow whisky={w} note={notes[w.id]} onUpdate={(patch) => onUpdate(w.id, patch)} />
          </Fragment>
        ))}
      </ul>
    </section>
  )
}
