import { useEffect, useMemo, useState } from 'react'
import { BarCard } from './components/BarCard'
import { SharedListBanner } from './components/SharedListBanner'
import { bars } from './data/bars'
import { floors } from './data/floors'
import { createShareUrl, mergeNotes, readSharedNotes, shareUrl } from './share'
import type { Floor, Notes, Whisky } from './types'
import { useNotes } from './useNotes'

type Filter = 'alle' | 'smakeliste' | 'ratet' | 'nominert' | 'pitstop'

const filters: { id: Filter; label: string }[] = [
  { id: 'alle', label: 'Alle' },
  { id: 'smakeliste', label: 'Vil smake' },
  { id: 'ratet', label: 'Ratet' },
  { id: 'nominert', label: 'Nominert' },
  { id: 'pitstop', label: 'Pit-stop' },
]

function matchesFilter(w: Whisky, filter: Filter, notes: Notes) {
  switch (filter) {
    case 'smakeliste':
      return !!notes[w.id]?.wantToTaste
    case 'ratet':
      return !!notes[w.id]?.rating
    case 'nominert':
      return !!w.nominee
    case 'pitstop':
      return !!w.pitStop
    default:
      return true
  }
}

export default function App() {
  const { notes, update, replaceAll } = useNotes()
  const [query, setQuery] = useState('')
  const [floor, setFloor] = useState<Floor | null>(null)
  const [filter, setFilter] = useState<Filter>('alle')
  const [sharedNotes, setSharedNotes] = useState<Notes | null>(null)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  useEffect(() => {
    const check = () => void readSharedNotes(window.location.hash).then(setSharedNotes)
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [])

  function closeSharedList() {
    setSharedNotes(null)
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  async function shareList() {
    try {
      const result = await shareUrl(await createShareUrl(notes))
      if (result === 'copied') setShareStatus('Lenke kopiert – lim den inn i SMS eller chat')
    } catch {
      setShareStatus('Klarte ikke å dele lenken')
    }
    setTimeout(() => setShareStatus(null), 4000)
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bars
      .filter((b) => floor === null || b.floor === floor)
      .map((b) => ({
        bar: b,
        whiskies: b.whiskies.filter(
          (w) =>
            matchesFilter(w, filter, notes) &&
            (!q || w.name.toLowerCase().includes(q) || b.name.toLowerCase().includes(q) || b.distributor.toLowerCase().includes(q)),
        ),
      }))
      .filter((x) => x.whiskies.length > 0)
  }, [query, floor, filter, notes])

  const allWhiskies = bars.flatMap((b) => b.whiskies)
  const wanted = allWhiskies.filter((w) => notes[w.id]?.wantToTaste)
  const wantedBonger = wanted.reduce((sum, w) => sum + w.bonger, 0)
  const rated = allWhiskies.filter((w) => notes[w.id]?.rating).length
  const hits = visible.reduce((sum, x) => sum + x.whiskies.length, 0)

  function exportNotes() {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'owf26-notater.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importNotes(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as Notes
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('Ugyldig format')
      if (confirm('Erstatte dine nåværende markeringer med innholdet i filen?')) replaceAll(parsed)
    } catch {
      alert('Klarte ikke å lese filen.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24">
      <header className="pt-8 pb-6">
        <p className="text-sm font-medium tracking-wide text-malt-300 uppercase">Den 22. Oslo Whiskyfestival</p>
        <h1 className="mt-1 text-3xl font-bold text-malt-50 sm:text-4xl">Barer & whisky 2026</h1>
        <p className="mt-2 text-sm text-malt-300">
          Fredag 6. nov 17–21 · Lørdag 7. nov 13–20 · Pit-stop dram fre 18:30 og lør 16:30 · 1 bong per påbegynte kr 750 (Vinmonopolet)
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-malt-900/60 p-3">
            <dt className="text-xs text-malt-300">Vil smake</dt>
            <dd className="text-2xl font-semibold text-amber-400 tabular-nums">{wanted.length}</dd>
          </div>
          <div className="rounded-lg bg-malt-900/60 p-3">
            <dt className="text-xs text-malt-300">Bonger på lista</dt>
            <dd className="text-2xl font-semibold tabular-nums">{wantedBonger}</dd>
          </div>
          <div className="rounded-lg bg-malt-900/60 p-3">
            <dt className="text-xs text-malt-300">Ratet</dt>
            <dd className="text-2xl font-semibold tabular-nums">{rated}</dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void shareList()}
            disabled={Object.keys(notes).length === 0}
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-malt-950 hover:bg-amber-300 disabled:opacity-40"
          >
            Del liste
          </button>
          {shareStatus && <span className="text-sm text-malt-300">{shareStatus}</span>}
        </div>
      </header>

      {sharedNotes && (
        <SharedListBanner
          shared={sharedNotes}
          onMerge={() => {
            replaceAll((prev) => mergeNotes(prev, sharedNotes))
            closeSharedList()
          }}
          onReplace={() => {
            if (!confirm('Erstatte hele din liste med den delte?')) return
            replaceAll(sharedNotes)
            closeSharedList()
          }}
          onDismiss={closeSharedList}
        />
      )}

      <section aria-label="Etasjeoversikt" className="grid gap-3 sm:grid-cols-3">
        {floors.map((f) => {
          const floorBars = bars.filter((b) => b.floor === f.floor)
          return (
            <div key={f.floor} className="rounded-xl border border-malt-900 bg-malt-900/30 p-4">
              <p className="text-xs text-malt-300">{f.floor}. etasje</p>
              <h2 className="text-lg font-semibold">{f.name}</h2>
              <p className="mt-0.5 text-xs text-malt-500">{f.extras}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {floorBars.map((b) => {
                  const n = b.whiskies.filter((w) => notes[w.id]?.wantToTaste).length
                  return (
                    <li key={b.id}>
                      <a
                        href={`#${b.id}`}
                        onClick={() => {
                          setFloor(null)
                          setFilter('alle')
                          setQuery('')
                        }}
                        className="flex justify-between gap-2 text-malt-100 hover:text-amber-300"
                      >
                        <span>{b.name}</span>
                        <span className="tabular-nums text-malt-500">
                          {n > 0 && <span className="text-amber-400">{n}/</span>}
                          {b.whiskies.length}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </section>

      <div className="sticky top-0 z-10 -mx-4 mt-6 space-y-2 border-b border-malt-900 bg-malt-950/95 px-4 py-3 backdrop-blur">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk etter whisky, bar eller importør…"
          className="w-full rounded-lg border border-malt-700 bg-malt-900/60 px-3 py-2 text-malt-50 placeholder:text-malt-500 outline-none focus:ring-2 focus:ring-malt-500"
        />
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {([null, 2, 3, 4] as const).map((f) => (
            <button
              key={f ?? 'alle'}
              type="button"
              onClick={() => setFloor(f)}
              className={`rounded-full px-3 py-1 ${floor === f ? 'bg-malt-100 text-malt-950' : 'bg-malt-900 text-malt-100 hover:bg-malt-700'}`}
            >
              {f === null ? 'Alle etasjer' : `${f}. etg`}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-malt-700" />
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
          <span className="ml-auto text-xs text-malt-500 tabular-nums">{hits} treff</span>
        </div>
      </div>

      <main className="mt-6 space-y-10">
        {floors
          .filter((f) => visible.some((x) => x.bar.floor === f.floor))
          .map((f) => (
            <div key={f.floor}>
              <h2 className="mb-3 text-xl font-semibold">
                <span className="text-malt-300">{f.floor}. etasje ·</span> {f.name}
              </h2>
              <div className="space-y-4">
                {visible
                  .filter((x) => x.bar.floor === f.floor)
                  .map(({ bar, whiskies }) => (
                    <BarCard key={bar.id} bar={bar} whiskies={whiskies} notes={notes} onUpdate={update} />
                  ))}
              </div>
            </div>
          ))}
        {visible.length === 0 && <p className="py-16 text-center text-malt-300">Ingen whisky matcher søket.</p>}
      </main>

      <footer className="mt-16 flex flex-wrap items-center gap-3 border-t border-malt-900 pt-6 text-sm text-malt-300">
        <span>Markeringer lagres lokalt i nettleseren.</span>
        <button type="button" onClick={exportNotes} className="rounded-md bg-malt-900 px-3 py-1.5 hover:bg-malt-700">
          Eksporter
        </button>
        <label className="cursor-pointer rounded-md bg-malt-900 px-3 py-1.5 hover:bg-malt-700">
          Importer
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void importNotes(file)
              e.target.value = ''
            }}
          />
        </label>
      </footer>
    </div>
  )
}
