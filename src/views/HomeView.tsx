import { BongCounter } from '../components/BongCounter'
import { NavButton } from '../components/NavButton'
import { PitStopBanner } from '../components/PitStopBanner'
import { bongerText } from '../data/floors'
import { allWhiskies } from '../data/lookup'
import { statsFor } from '../noteStatus'
import type { Notes } from '../types'
import { href } from '../useRoute'
import { useStoredNumber } from '../useStoredNumber'

interface Props {
  notes: Notes
  onShare: () => void
  shareStatus: string | null
  onExport: () => void
  onImport: (file: File) => void
}

export function HomeView({ notes, onShare, shareStatus, onExport, onImport }: Props) {
  const stats = statsFor(allWhiskies, notes)
  const [bought, setBought] = useStoredNumber('owf26-bonger-kjopt')

  return (
    <>
      <header className="pt-8 pb-6">
        <p className="text-sm font-medium tracking-wide text-malt-300 uppercase">Den 22. Oslo Whiskyfestival</p>
        <h1 className="mt-1 text-3xl font-bold text-malt-50">Barer & whisky 2026</h1>
        <p className="mt-2 text-sm text-malt-300">Fredag 6. nov 17–21 · Lørdag 7. nov 13–20</p>
        <p className="text-sm text-malt-300">Pit-stop dram fre 18:30 og lør 16:30</p>

        <dl className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          <a href={href({ view: 'wishlist' })} className="rounded-xl bg-amber-400/10 p-3 hover:bg-amber-400/20">
            <dt className="text-xs text-amber-200">Må smake</dt>
            <dd className="text-3xl font-semibold tabular-nums text-amber-400">
              {stats.mustDone}
              <span className="text-lg text-amber-400/60">/{stats.must}</span>
            </dd>
            <dd className="text-xs text-malt-300">
              {stats.mustBonger - stats.mustBongerLeft}/{bongerText(stats.mustBonger)}
            </dd>
          </a>
          <a href={href({ view: 'maybe' })} className="rounded-xl bg-amber-200/5 p-3 hover:bg-amber-200/10">
            <dt className="text-xs text-amber-100/80">Kanskje</dt>
            <dd className="text-3xl font-semibold tabular-nums text-amber-200/90">
              {stats.maybeDone}
              <span className="text-lg text-amber-200/50">/{stats.maybe}</span>
            </dd>
            <dd className="text-xs text-malt-300">
              {stats.maybeBonger - stats.maybeBongerLeft}/{bongerText(stats.maybeBonger)}
            </dd>
          </a>
          <a href={href({ view: 'tasted' })} className="rounded-xl bg-emerald-400/10 p-3 hover:bg-emerald-400/20">
            <dt className="text-xs text-emerald-200">Har smakt</dt>
            <dd className="text-3xl font-semibold tabular-nums text-emerald-400">{stats.tasted}</dd>
            <dd className="text-xs text-malt-300">{bongerText(stats.tastedBonger)} brukt</dd>
          </a>
        </dl>
      </header>

      <div className="mb-6 space-y-3">
        <PitStopBanner notes={notes} />
        <BongCounter bought={bought} onChange={setBought} stats={stats} />
      </div>

      <nav className="space-y-3">
        <NavButton href={href({ view: 'floors' })} title="Barer" subtitle="Velg etasje og bar" aside={<span className="text-sm text-malt-300">3 etasjer</span>} />
        <NavButton href={href({ view: 'wishlist' })} title="Vil smake" subtitle="Må smake og kanskje – med hake for det du har smakt" accent="amber" />
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
