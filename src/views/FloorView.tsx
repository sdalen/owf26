import { useState } from 'react'
import { NavButton } from '../components/NavButton'
import { StatusCounts } from '../components/StatusCounts'
import { TopBar } from '../components/TopBar'
import { bars } from '../data/bars'
import { floors } from '../data/floors'
import { statsFor } from '../noteStatus'
import type { Floor, Notes } from '../types'
import { href } from '../useRoute'

export function FloorView({ floor, notes }: { floor: Floor; notes: Notes }) {
  const info = floors.find((f) => f.floor === floor)!
  const [showPlan, setShowPlan] = useState(false)
  const planUrl = `${import.meta.env.BASE_URL}floors/etasje-${floor}.png`

  return (
    <>
      <TopBar title={`${floor}. etasje · ${info.name}`} subtitle={info.extras} back={href({ view: 'floors' })} />

      <button
        type="button"
        onClick={() => setShowPlan((v) => !v)}
        aria-expanded={showPlan}
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-malt-900 bg-malt-900/50 px-4 py-3 text-left font-medium hover:bg-malt-900"
      >
        Plantegning
        <span className="text-malt-500">{showPlan ? '▴' : '▾'}</span>
      </button>
      {showPlan && (
        <a href={planUrl} target="_blank" rel="noreferrer" className="mb-4 block overflow-hidden rounded-xl bg-white">
          <img src={planUrl} alt={`Plantegning for ${floor}. etasje, ${info.name}`} className="w-full" />
        </a>
      )}

      <div className="space-y-3">
        {bars
          .filter((b) => b.floor === floor)
          .map((b) => (
            <NavButton
              key={b.id}
              href={href({ view: 'bar', barId: b.id })}
              title={b.name}
              subtitle={`${b.whiskies.length} whisky${b.distributor !== b.name ? ` · ${b.distributor}` : ''}`}
              aside={<StatusCounts stats={statsFor(b.whiskies, notes)} />}
            />
          ))}
      </div>
    </>
  )
}
