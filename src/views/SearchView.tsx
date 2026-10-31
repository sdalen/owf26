import { type ReactNode, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { WhiskyRow } from '../components/WhiskyRow'
import { bars } from '../data/bars'
import { allWhiskies, barById, type WhiskyWithBar } from '../data/lookup'
import type { Floor, Notes, WhiskyNote } from '../types'
import { href } from '../useRoute'

type Filter = 'alle' | 'nominert' | 'pitstop-fre' | 'pitstop-lor' | 'ratet'

const filters: { id: Filter; label: string }[] = [
  { id: 'alle', label: 'Alle' },
  { id: 'pitstop-fre', label: 'Pit-stop fredag' },
  { id: 'pitstop-lor', label: 'Pit-stop lørdag' },
  { id: 'nominert', label: 'Best i festival-nominert' },
  { id: 'ratet', label: 'Ratet' },
]

function matchesFilter(w: WhiskyWithBar, filter: Filter, notes: Notes) {
  switch (filter) {
    case 'nominert':
      return !!w.nominee
    case 'pitstop-fre':
      return !!w.pitStop?.includes('fre')
    case 'pitstop-lor':
      return !!w.pitStop?.includes('lør')
    case 'ratet':
      return !!notes[w.id]?.rating
    default:
      return true
  }
}

type BongRange = '1' | '2' | '3' | '4' | '5-10' | '10+'

const bongRanges: { id: BongRange; label: string; test: (n: number) => boolean }[] = [
  { id: '1', label: '1', test: (n) => n === 1 },
  { id: '2', label: '2', test: (n) => n === 2 },
  { id: '3', label: '3', test: (n) => n === 3 },
  { id: '4', label: '4', test: (n) => n === 4 },
  { id: '5-10', label: '5–10', test: (n) => n >= 5 && n <= 10 },
  { id: '10+', label: 'Over 10', test: (n) => n > 10 },
]

function Chip({ active, onClick, children, tone = 'light' }: { active: boolean; onClick: () => void; children: ReactNode; tone?: 'light' | 'amber' }) {
  const on = tone === 'amber' ? 'bg-amber-400 text-malt-950' : 'bg-malt-100 text-malt-950'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3 py-1 whitespace-nowrap ${active ? on : 'bg-malt-900 text-malt-100 hover:bg-malt-700'}`}
    >
      {children}
    </button>
  )
}

/** En rad med hurtigvalg som kan scrolles sidelengs på mobil */
function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-14 shrink-0 text-malt-300">{label}</span>
      <div className="-mr-4 flex min-w-0 flex-1 gap-2 overflow-x-auto pr-4 pb-0.5 [scrollbar-width:none]">{children}</div>
    </div>
  )
}

interface Props {
  notes: Notes
  onUpdate: (id: string, patch: Partial<WhiskyNote>) => void
}

export function SearchView({ notes, onUpdate }: Props) {
  const [query, setQuery] = useState('')
  const [floor, setFloor] = useState<Floor | null>(null)
  const [barId, setBarId] = useState<string | null>(null)
  const [bong, setBong] = useState<BongRange | null>(null)
  const [filter, setFilter] = useState<Filter>('alle')

  const barsToPick = bars.filter((b) => floor === null || b.floor === floor)

  function pickFloor(f: Floor | null) {
    setFloor(f)
    // Valgt bar må ligge i etasjen som velges
    if (barId && f !== null && barById.get(barId)?.floor !== f) setBarId(null)
  }

  const q = query.trim().toLowerCase()
  const range = bongRanges.find((r) => r.id === bong)
  const results = allWhiskies.filter(
      (w) =>
        (floor === null || w.bar.floor === floor) &&
        (barId === null || w.bar.id === barId) &&
        (!range || range.test(w.bonger)) &&
        matchesFilter(w, filter, notes) &&
        (!q || w.name.toLowerCase().includes(q) || w.bar.name.toLowerCase().includes(q) || w.bar.distributor.toLowerCase().includes(q)),
  )

  const filtered = query.trim() !== '' || filter !== 'alle' || floor !== null || barId !== null || bong !== null

  function reset() {
    setQuery('')
    setFloor(null)
    setBarId(null)
    setBong(null)
    setFilter('alle')
  }

  return (
    <>
      <TopBar title="Søk i all whisky" subtitle={filtered ? `${results.length} av ${allWhiskies.length} whisky` : `Alle ${allWhiskies.length} whisky`} back={href({ view: 'home' })}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Whisky, bar eller importør…"
          className="w-full rounded-lg border border-malt-700 bg-malt-900/60 px-3 py-2 text-malt-50 placeholder:text-malt-500 outline-none focus:ring-2 focus:ring-malt-500"
        />
      </TopBar>

      <div className="mb-4 space-y-2">
        <ChipRow label="Etasje">
          {([null, 2, 3, 4] as const).map((f) => (
            <Chip key={f ?? 'alle'} active={floor === f} onClick={() => pickFloor(f)}>
              {f === null ? 'Alle' : `${f}. etg`}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow label="Bar">
          <Chip active={barId === null} onClick={() => setBarId(null)}>
            Alle
          </Chip>
          {barsToPick.map((b) => (
            <Chip key={b.id} active={barId === b.id} onClick={() => setBarId(barId === b.id ? null : b.id)}>
              {b.name}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow label="Bonger">
          <Chip active={bong === null} onClick={() => setBong(null)}>
            Alle
          </Chip>
          {bongRanges.map((r) => (
            <Chip key={r.id} active={bong === r.id} onClick={() => setBong(bong === r.id ? null : r.id)}>
              {r.label}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow label="Vis">
          {filters.map((f) => (
            <Chip key={f.id} tone="amber" active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </ChipRow>
        {filtered && (
          <button type="button" onClick={reset} className="text-sm text-malt-300 underline underline-offset-2 hover:text-malt-50">
            Nullstill søk og filtre
          </button>
        )}
      </div>

      {results.length === 0 && <p className="py-16 text-center text-malt-300">Ingen whisky matcher søket.</p>}
      {results.length > 0 && (
        <ul className="divide-y divide-malt-900 overflow-hidden rounded-xl border border-malt-900 bg-malt-900/40">
          {results.map((w) => (
            <WhiskyRow key={w.id} whisky={w} note={notes[w.id]} onUpdate={(patch) => onUpdate(w.id, patch)} bar={w.bar} />
          ))}
        </ul>
      )}
    </>
  )
}
