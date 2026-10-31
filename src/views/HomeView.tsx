import { NavButton } from '../components/NavButton'
import { allWhiskies } from '../data/lookup'
import type { Notes } from '../types'
import { href } from '../useRoute'

interface Props {
  notes: Notes
  onShare: () => void
  shareStatus: string | null
  onExport: () => void
  onImport: (file: File) => void
}

export function HomeView({ notes, onShare, shareStatus, onExport, onImport }: Props) {
  const wanted = allWhiskies.filter((w) => notes[w.id]?.wantToTaste && !notes[w.id]?.tasted)
  const tasted = allWhiskies.filter((w) => notes[w.id]?.tasted)
  const wantedBonger = wanted.reduce((sum, w) => sum + w.bonger, 0)
  const tastedBonger = tasted.reduce((sum, w) => sum + w.bonger, 0)

  return (
    <>
      <header className="pt-8 pb-6">
        <p className="text-sm font-medium tracking-wide text-malt-300 uppercase">Den 22. Oslo Whiskyfestival</p>
        <h1 className="mt-1 text-3xl font-bold text-malt-50">Barer & whisky 2026</h1>
        <p className="mt-2 text-sm text-malt-300">Fredag 6. nov 17–21 · Lørdag 7. nov 13–20</p>
        <p className="text-sm text-malt-300">Pit-stop dram fre 18:30 og lør 16:30</p>

        <dl className="mt-5 grid grid-cols-2 gap-3">
          <a href={href({ view: 'wishlist' })} className="rounded-xl bg-amber-400/10 p-3 hover:bg-amber-400/20">
            <dt className="text-xs text-amber-200">Vil smake</dt>
            <dd className="text-3xl font-semibold tabular-nums text-amber-400">{wanted.length}</dd>
            <dd className="text-xs text-malt-300">{wantedBonger} bonger</dd>
          </a>
          <a href={href({ view: 'tasted' })} className="rounded-xl bg-emerald-400/10 p-3 hover:bg-emerald-400/20">
            <dt className="text-xs text-emerald-200">Har smakt</dt>
            <dd className="text-3xl font-semibold tabular-nums text-emerald-400">{tasted.length}</dd>
            <dd className="text-xs text-malt-300">{tastedBonger} bonger brukt</dd>
          </a>
        </dl>
      </header>

      <nav className="space-y-3">
        <NavButton href={href({ view: 'floors' })} title="Barer" subtitle="Velg etasje og bar" aside={<span className="text-sm text-malt-300">3 etasjer</span>} />
        <NavButton href={href({ view: 'wishlist' })} title="Vil smake" subtitle="Det du har markert, sortert etter etasje og bar" accent="amber" />
        <NavButton href={href({ view: 'tasted' })} title="Har smakt" subtitle="Med rating og Whiskybase-lenker" accent="emerald" />
        <NavButton href={href({ view: 'search' })} title="Søk i all whisky" subtitle={`${allWhiskies.length} whiskyer · nominerte · pit-stop`} />
      </nav>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onShare}
          disabled={Object.keys(notes).length === 0}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-malt-950 hover:bg-amber-300 disabled:opacity-40"
        >
          Del liste
        </button>
        {shareStatus && <span className="text-sm text-malt-300">{shareStatus}</span>}
      </div>

      <footer className="mt-12 flex flex-wrap items-center gap-3 border-t border-malt-900 pt-6 text-sm text-malt-300">
        <span>Markeringer lagres lokalt på denne enheten. 1 bong per påbegynte kr 750 (Vinmonopolet).</span>
        <button type="button" onClick={onExport} className="rounded-md bg-malt-900 px-3 py-1.5 hover:bg-malt-700">
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
              if (file) onImport(file)
              e.target.value = ''
            }}
          />
        </label>
      </footer>
    </>
  )
}
