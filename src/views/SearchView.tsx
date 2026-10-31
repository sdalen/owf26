import { useMemo, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { WhiskyRow } from '../components/WhiskyRow'
import { allWhiskies, type WhiskyWithBar } from '../data/lookup'
import type { Floor, Notes, WhiskyNote } from '../types'
import { href } from '../useRoute'

type Filter = 'alle' | 'nominert' | 'pitstop' | 'ratet'

const filters: { id: Filter; label: string }[] = [
  { id: 'alle', label: 'Alle' },
  { id: 'nominert', label: 'Nominert' },
  { id: 'pitstop', label: 'Pit-stop' },
  { id: 'ratet', label: 'Ratet' },
]

function matchesFilter(w: WhiskyWithBar, filter: Filter, notes: Notes) {
  switch (filter) {
    case 'nominert':
      return !!w.nominee
    case 'pitstop':
      return !!w.pitStop
    case 'ratet':
      return !!notes[w.id]?.rating
    default:
      return true
  }
}

interface Props {
  notes: Notes
  onUpdate: (id: string, patch: Partial<WhiskyNote>) => void
}

export function SearchView({ notes, onUpdate }: Props) {
  const [query, setQuery] = useState('')
  const [floor, setFloor] = useState<Floor | null>(null)
  const [filter, setFilter] = useState<Filter>('alle')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allWhiskies.filter(
      (w) =>
        (floor === null || w.bar.floor === floor) &&
        matchesFilter(w, filter, notes) &&
        (!q || w.name.toLowerCase().includes(q) || w.bar.name.toLowerCase().includes(q) || w.bar.distributor.toLowerCase().includes(q)),
    )
  }, [query, floor, filter, notes])

  // Uten søk/filter vises ikke hele lista – den er for lang til å bla i
  const showResults = query.trim() !== '' || filter !== 'alle' || floor !== null
  const shown = results.slice(0, 100)

  return (
    <>
      <TopBar title="Søk i all whisky" subtitle={showResults ? `${results.length} treff` : `${allWhiskies.length} whisky`} back={href({ view: 'home' })}>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Whisky, bar eller importør…"
          className="w-full rounded-lg border border-malt-700 bg-malt-900/60 px-3 py-2 text-malt-50 placeholder:text-malt-500 outline-none focus:ring-2 focus:ring-malt-500"
        />
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          {([null, 2, 3, 4] as const).map((f) => (
            <button
              key={f ?? 'alle'}
              type="button"
              onClick={() => setFloor(f)}
              className={`rounded-full px-3 py-1 ${floor === f ? 'bg-malt-100 text-malt-950' : 'bg-malt-900 text-malt-100 hover:bg-malt-700'}`}
            >
              {f === null ? 'Alle etg' : `${f}. etg`}
            </button>
          ))}
          <span className="mx-1 h-5 w-px self-center bg-malt-700" />
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1 ${filter === f.id ? 'bg-amber-400 text-malt-950' : 'bg-malt-900 text-malt-100 hover:bg-malt-700'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </TopBar>

      {showResults && results.length === 0 && <p className="py-16 text-center text-malt-300">Ingen whisky matcher søket.</p>}
      {showResults && results.length > 0 && (
        <ul className="divide-y divide-malt-900 overflow-hidden rounded-xl border border-malt-900 bg-malt-900/40">
          {shown.map((w) => (
            <WhiskyRow
              key={w.id}
              whisky={w}
              note={notes[w.id]}
              onUpdate={(patch) => onUpdate(w.id, patch)}
              bar={w.bar}
            />
          ))}
        </ul>
      )}
      {results.length > shown.length && showResults && (
        <p className="mt-3 text-center text-sm text-malt-500">Viser {shown.length} av {results.length} – snevre inn søket</p>
      )}
    </>
  )
}
