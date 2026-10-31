import { TopBar } from '../components/TopBar'
import { allWhiskies } from '../data/lookup'
import { formatScore } from '../score'
import type { Notes } from '../types'
import { href } from '../useRoute'

/** Enkel oversikt over alt du har smakt, høyest score først */
export function TastedListView({ notes }: { notes: Notes }) {
  const tasted = allWhiskies
    .filter((w) => notes[w.id]?.tasted)
    .sort((a, b) => (notes[b.id]?.score ?? -1) - (notes[a.id]?.score ?? -1) || a.name.localeCompare(b.name, 'nb'))
  const scored = tasted.filter((w) => notes[w.id]?.score !== undefined)
  const average = scored.length > 0 ? scored.reduce((sum, w) => sum + notes[w.id]!.score!, 0) / scored.length : undefined

  return (
    <>
      <TopBar
        title="Smakt-liste"
        subtitle={`${tasted.length} whisky${average !== undefined ? ` · snitt ${formatScore(average)}` : ''}`}
        back={href({ view: 'home' })}
      />

      {tasted.length === 0 ? (
        <p className="py-16 text-center text-malt-300">Du har ikke markert noe som smakt ennå.</p>
      ) : (
        <ol className="card divide-y divide-white/5 overflow-hidden">
          {tasted.map((w, i) => {
            const score = notes[w.id]?.score
            return (
              <li key={w.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-6 shrink-0 text-right text-xs tabular-nums text-malt-500">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-malt-50">{w.name}</p>
                  <p className="truncate text-xs text-malt-500">
                    {w.bar.name} · {w.bar.floor}. etg
                  </p>
                </div>
                <span className={`shrink-0 font-display text-xl font-semibold tabular-nums ${score === undefined ? 'text-malt-700' : 'text-amber-300'}`}>
                  {score === undefined ? '–' : formatScore(score)}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}
