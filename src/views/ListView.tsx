import { TopBar } from '../components/TopBar'
import { WhiskyRow } from '../components/WhiskyRow'
import { floors } from '../data/floors'
import { allWhiskies, type WhiskyWithBar } from '../data/lookup'
import type { Notes, WhiskyNote } from '../types'
import { href } from '../useRoute'

interface Props {
  mode: 'wishlist' | 'tasted'
  notes: Notes
  onUpdate: (id: string, patch: Partial<WhiskyNote>) => void
}

export function ListView({ mode, notes, onUpdate }: Props) {
  const items =
    mode === 'wishlist'
      ? // Smakte whiskyer flyttes over til «Har smakt»
        allWhiskies.filter((w) => notes[w.id]?.wantToTaste && !notes[w.id]?.tasted)
      : allWhiskies.filter((w) => notes[w.id]?.tasted).sort((a, b) => (notes[b.id]?.rating ?? 0) - (notes[a.id]?.rating ?? 0))
  const bonger = items.reduce((sum, w) => sum + w.bonger, 0)

  const row = (w: WhiskyWithBar, showLocation: boolean) => (
    <WhiskyRow
      key={w.id}
      whisky={w}
      note={notes[w.id]}
      onUpdate={(patch) => onUpdate(w.id, patch)}
      location={showLocation ? `${w.bar.name} · ${w.bar.floor}. etg` : undefined}
    />
  )

  return (
    <>
      <TopBar
        title={mode === 'wishlist' ? 'Vil smake' : 'Har smakt'}
        subtitle={`${items.length} whisky · ${bonger} bonger${mode === 'tasted' ? ' brukt' : ''}`}
        back={href({ view: 'home' })}
      />

      {items.length === 0 && (
        <div className="py-16 text-center text-malt-300">
          <p>{mode === 'wishlist' ? 'Ingenting på lista ennå.' : 'Du har ikke markert noe som smakt ennå.'}</p>
          <a href={href({ view: 'floors' })} className="mt-3 inline-block text-amber-400 underline underline-offset-2">
            Gå til barene
          </a>
        </div>
      )}

      {mode === 'wishlist' ? (
        // Gruppert etter etasje og bar, så lista kan brukes som rute gjennom festivalen
        <div className="space-y-8">
          {floors
            .filter((f) => items.some((w) => w.bar.floor === f.floor))
            .map((f) => {
              const floorItems = items.filter((w) => w.bar.floor === f.floor)
              const barsOnFloor = [...new Map(floorItems.map((w) => [w.bar.id, w.bar])).values()]
              return (
                <section key={f.floor}>
                  <h2 className="mb-3 text-lg font-semibold">
                    <span className="text-malt-300">{f.floor}. etasje ·</span> {f.name}
                  </h2>
                  <div className="space-y-4">
                    {barsOnFloor.map((bar) => (
                      <div key={bar.id} className="overflow-hidden rounded-xl border border-malt-900 bg-malt-900/40">
                        <a href={href({ view: 'bar', barId: bar.id })} className="flex justify-between border-b border-malt-900 bg-malt-900/70 px-4 py-2 font-semibold hover:text-amber-300">
                          {bar.name} <span className="text-malt-500">›</span>
                        </a>
                        <ul className="divide-y divide-malt-900">{floorItems.filter((w) => w.bar.id === bar.id).map((w) => row(w, false))}</ul>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
        </div>
      ) : (
        items.length > 0 && (
          <ul className="divide-y divide-malt-900 overflow-hidden rounded-xl border border-malt-900 bg-malt-900/40">{items.map((w) => row(w, true))}</ul>
        )
      )}
    </>
  )
}
