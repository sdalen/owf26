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
  { id: 'ratet', label: 'Med score' },
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
      return notes[w.id]?.score !== undefined
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

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 font-medium whitespace-nowrap ring-1 transition ${active ? 'bg-amber-400 text-malt-950 ring-amber-400' : 'bg-white/5 text-malt-100 ring-white/5 hover:bg-white/10'}`}
    >
      {children}
    </button>
  )
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[11px] font-semibold tracking-wide text-malt-500 uppercase">{label}</legend>
      <div className="flex flex-wrap gap-2 text-sm">{children}</div>
    </fieldset>
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
  const [panelOpen, setPanelOpen] = useState(false)

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

  // Aktive filtre vises som brikker med × når panelet er lukket
  const active: { key: string; label: string; clear: () => void }[] = []
  if (floor !== null) active.push({ key: 'floor', label: `${floor}. etg`, clear: () => setFloor(null) })
  if (barId !== null) active.push({ key: 'bar', label: barById.get(barId)?.name ?? barId, clear: () => setBarId(null) })
  if (range) active.push({ key: 'bong', label: `${range.label} ${range.id === '1' ? 'bong' : 'bonger'}`, clear: () => setBong(null) })
  if (filter !== 'alle') active.push({ key: 'vis', label: filters.find((f) => f.id === filter)!.label, clear: () => setFilter('alle') })

  const filtered = q !== '' || active.length > 0

  function reset() {
    setFloor(null)
    setBarId(null)
    setBong(null)
    setFilter('alle')
  }

  return (
    <>
      <TopBar title="Søk i all whisky" subtitle={filtered ? `${results.length} av ${allWhiskies.length} whisky` : `Alle ${allWhiskies.length} whisky`} back={href({ view: 'home' })}>
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Whisky, bar eller importør…"
            className="min-w-0 flex-1 rounded-xl bg-malt-900 px-3.5 py-2.5 text-malt-50 ring-1 ring-white/5 placeholder:text-malt-500 outline-none focus:ring-2 focus:ring-amber-400/60"
          />
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 font-semibold ring-1 transition ${
              panelOpen || active.length > 0 ? 'bg-amber-400/15 text-amber-200 ring-amber-400/50' : 'bg-malt-900 text-malt-100 ring-white/5'
            }`}
          >
            Filter
            {active.length > 0 && <span className="rounded-full bg-amber-400 px-1.5 text-xs leading-5 text-malt-950">{active.length}</span>}
          </button>
        </div>

        {!panelOpen && active.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {active.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={a.clear}
                aria-label={`Fjern filter ${a.label}`}
                className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 font-medium text-amber-100 ring-1 ring-amber-400/30 hover:bg-amber-400/25"
              >
                {a.label} <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        )}

        {panelOpen && (
          <div className="card mt-3 max-h-[65vh] space-y-4 overflow-y-auto p-4">
            <FilterGroup label="Etasje">
              {([null, 2, 3, 4] as const).map((f) => (
                <Chip key={f ?? 'alle'} active={floor === f} onClick={() => pickFloor(f)}>
                  {f === null ? 'Alle' : `${f}. etg`}
                </Chip>
              ))}
            </FilterGroup>

            <fieldset>
              <legend className="mb-2 text-[11px] font-semibold tracking-wide text-malt-500 uppercase">Bar</legend>
              <select
                value={barId ?? ''}
                onChange={(e) => setBarId(e.target.value || null)}
                className="w-full rounded-xl bg-malt-950 px-3 py-2.5 text-malt-50 ring-1 ring-malt-700 outline-none focus:ring-2 focus:ring-amber-400/60"
              >
                <option value="">Alle barer{floor !== null ? ` i ${floor}. etg` : ''}</option>
                {barsToPick.map((b) => (
                  <option key={b.id} value={b.id}>
                    {floor === null ? `${b.floor}. etg – ` : ''}
                    {b.name}
                  </option>
                ))}
              </select>
            </fieldset>

            <FilterGroup label="Bonger">
              <Chip active={bong === null} onClick={() => setBong(null)}>
                Alle
              </Chip>
              {bongRanges.map((r) => (
                <Chip key={r.id} active={bong === r.id} onClick={() => setBong(bong === r.id ? null : r.id)}>
                  {r.label}
                </Chip>
              ))}
            </FilterGroup>

            <FilterGroup label="Vis">
              {filters.map((f) => (
                <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
                  {f.label}
                </Chip>
              ))}
            </FilterGroup>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={reset}
                disabled={active.length === 0}
                className="text-sm text-malt-300 underline underline-offset-2 hover:text-malt-50 disabled:invisible"
              >
                Nullstill
              </button>
              <button type="button" onClick={() => setPanelOpen(false)} className="rounded-xl bg-amber-400 px-4 py-2.5 font-semibold text-malt-950 hover:bg-amber-300">
                Vis {results.length} whisky
              </button>
            </div>
          </div>
        )}
      </TopBar>

      {results.length === 0 && <p className="py-16 text-center text-malt-300">Ingen whisky matcher søket.</p>}
      {results.length > 0 && (
        <ul className="space-y-2.5">
          {results.map((w) => (
            <WhiskyRow key={w.id} whisky={w} note={notes[w.id]} onUpdate={(patch) => onUpdate(w.id, patch)} bar={w.bar} />
          ))}
        </ul>
      )}
    </>
  )
}
