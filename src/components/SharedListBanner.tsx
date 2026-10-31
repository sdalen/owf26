import { whiskyById } from '../data/lookup'
import type { Notes } from '../types'

interface Props {
  shared: Notes
  onMerge: () => void
  onReplace: () => void
  onDismiss: () => void
}

export function SharedListBanner({ shared, onMerge, onReplace, onDismiss }: Props) {
  const wanted = Object.entries(shared)
    .filter(([, n]) => n.wantToTaste || n.maybe)
    .map(([id]) => whiskyById.get(id))
    .filter((w) => w !== undefined)
  const tasted = Object.values(shared).filter((n) => n.tasted).length

  return (
    <section className="mb-6 rounded-xl border border-amber-400/60 bg-amber-400/10 p-4">
      <h2 className="font-semibold text-amber-300">Du har åpnet en delt liste</h2>
      <p className="mt-1 text-sm text-malt-100">
        {wanted.length} vil smake/kanskje · {tasted} smakt · {wanted.reduce((sum, w) => sum + w.bonger, 0)} bonger
      </p>
      {wanted.length > 0 && (
        <ul className="mt-3 max-h-60 space-y-1 overflow-y-auto text-sm">
          {wanted.map((w) => (
            <li key={w.id} className="flex justify-between gap-3">
              <span>
                {w.name} <span className="text-malt-500">· {w.bar.name}, {w.bar.floor}. etg</span>
              </span>
              <span className="shrink-0 tabular-nums text-malt-300">{w.bonger}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button type="button" onClick={onMerge} className="rounded-md bg-amber-400 px-3 py-1.5 font-semibold text-malt-950 hover:bg-amber-300">
          Legg til i min liste
        </button>
        <button type="button" onClick={onReplace} className="rounded-md bg-malt-900 px-3 py-1.5 hover:bg-malt-700">
          Erstatt min liste
        </button>
        <button type="button" onClick={onDismiss} className="rounded-md px-3 py-1.5 text-malt-300 hover:text-malt-50">
          Lukk
        </button>
      </div>
    </section>
  )
}
