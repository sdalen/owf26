import type { ReactNode } from 'react'
import { BongCounter } from "../components/BongCounter";
import { CostCard } from "../components/CostCard";
import { InfoButton } from "../components/InfoButton";
import { NavButton } from "../components/NavButton";
import { PitStopBanner } from "../components/PitStopBanner";
import { bars } from "../data/bars";
import { PIT_STOPS } from "../data/pitStops";
import { allWhiskies } from "../data/lookup";
import { statsFor } from "../noteStatus";
import type { Notes } from "../types";
import { href } from "../useRoute";
import { usedPitStopBongs } from "../pitStopBongs";
import { useStoredNumber } from "../useStoredNumber";

interface Props {
  notes: Notes;
  onShare: () => void;
  shareStatus: string | null;
  onExport: () => void;
  onImport: (file: File) => void;
  ticketDays: number;
  onTicketDaysChange: (days: number) => void;
}

export function HomeView({
  notes,
  onShare,
  shareStatus,
  onExport,
  onImport,
  ticketDays,
  onTicketDaysChange,
}: Props) {
  const stats = statsFor(allWhiskies, notes);
  const usedBongs = usedPitStopBongs(notes);
  const [extra, setExtra] = useStoredNumber("owf26-bonger-ekstra");

  const listTotal = stats.must + stats.maybe + stats.tasted - stats.mustDone - stats.maybeDone

  return (
    <>
      <header className="pt-[max(2.5rem,env(safe-area-inset-top))] pb-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-[clamp(1.4rem,6.4vw,2.375rem)] leading-[1.05] font-semibold tracking-tight text-malt-50">Oslo Whiskyfestival 2026</h1>
          <InfoButton />
        </div>
        <p className="mt-3 text-sm text-malt-300">Fredag 6. nov 17–21 · Lørdag 7. nov 13–20</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {PIT_STOPS.map((p) => (
            <a
              key={p.day}
              href={href({ view: 'pitstop', day: p.day })}
              className={`pit-${p.day} flex items-center justify-between gap-2 rounded-2xl bg-pit-400/10 px-3.5 py-2.5 ring-1 ring-pit-300/20 transition hover:bg-pit-400/15 active:scale-[0.98]`}
            >
              <span>
                <span className="block text-[11px] font-semibold tracking-wide text-pit-300 uppercase">Pit-stop {p.label}</span>
                <span className="font-display text-lg leading-tight font-semibold text-malt-50">
                  {p.start.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' })}
                </span>
                <span className="ml-1.5 text-xs text-malt-300">{allWhiskies.filter((w) => w.pitStop?.includes(p.day)).length} drammer</span>
              </span>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-pit-300/70" aria-hidden>
                <path d="M7.5 4.5 13 10l-5.5 5.5" />
              </svg>
            </a>
          ))}
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-2">
          <StatCard href={href({ view: 'wishlist', show: 'must' })} label="♥ Må smake" color="text-amber-300">
            <StatValue value={stats.must - stats.mustDone} />
          </StatCard>
          <StatCard href={href({ view: 'wishlist', show: 'maybe' })} label="? Kanskje" color="text-amber-200/80">
            <StatValue value={stats.maybe - stats.maybeDone} />
          </StatCard>
          <StatCard href={href({ view: 'wishlist', show: 'tasted' })} label="✓ Har smakt" color="text-emerald-300">
            {/* Hvor mange du har smakt, av alt på lista (må smake, kanskje og det du har smakt uten å markere) */}
            <StatValue value={stats.tasted} />
            {listTotal > 0 && <dd className="mt-1 text-[11px] text-malt-300 tabular-nums">av {listTotal}</dd>}
          </StatCard>
        </dl>
      </header>

      <div className="mb-6 space-y-3">
        <PitStopBanner notes={notes} ticketDays={ticketDays} usedPitStopBongs={usedBongs} />
        <CostCard ticketDays={ticketDays} extra={extra} />
        <BongCounter ticketDays={ticketDays} onTicketDaysChange={onTicketDaysChange} extra={extra} onExtraChange={setExtra} stats={stats} notes={notes} usedPitStopBongs={usedBongs} />
      </div>

      <nav className="space-y-2">
        <NavButton href={href({ view: 'floors' })} icon="🥃" title="Barer" subtitle={`${bars.length} barer fordelt på 3 etasjer`} />
        <NavButton href={href({ view: 'wishlist' })} icon="♥" accent="amber" title="Min liste" subtitle="Må smake, kanskje og smakt – med score, notater og eksport" />
        <NavButton href={href({ view: 'search' })} icon="⌕" title="Søk i all whisky" subtitle={`${allWhiskies.length} whisky · filter på bar, bonger og pit-stop`} />
      </nav>

      <div className="mt-6 space-y-2 text-center">
        <button
          type="button"
          onClick={onShare}
          disabled={Object.keys(notes).length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-malt-950 shadow-lg shadow-amber-400/10 transition hover:bg-amber-300 active:scale-[0.99] disabled:opacity-40"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
            <path d="M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5M4 11v4.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V11" />
          </svg>
          Del lista mi
        </button>
        {shareStatus && (
          <span className="text-sm text-malt-300">{shareStatus}</span>
        )}
      </div>

      <div className="mt-6">
        <NavButton
          href={href({ view: 'tastedList' })}
          icon="≡"
          accent="emerald"
          title="Smakt-liste"
          subtitle={stats.tasted > 0 ? `${stats.tasted} whisky med din score` : 'Alt du har smakt, med score'}
        />
      </div>

      <footer className="mt-12 border-t border-white/5 pt-6 text-xs text-malt-500">
        <div className="flex gap-2">
        <button
          type="button"
          onClick={onExport}
          className="rounded-full bg-white/5 px-3 py-1.5 text-malt-300 ring-1 ring-white/5 hover:bg-white/10"
        >
          Eksporter
        </button>
        <label className="cursor-pointer rounded-full bg-white/5 px-3 py-1.5 text-malt-300 ring-1 ring-white/5 hover:bg-white/10">
          Importer
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImport(file);
              e.target.value = "";
            }}
          />
        </label>
        </div>
        <p className="mt-3">
          Markeringer lagres lokalt på denne enheten. 1 bong per påbegynte kr
          750 (Vinmonopolet).
        </p>
      </footer>
    </>
  );
}

function StatCard({ href, label, color, children }: { href: string; label: string; color: string; children: ReactNode }) {
  return (
    <a href={href} className="card block p-3 transition hover:bg-malt-800 active:scale-[0.98]">
      <dt className={`mb-2 text-[11px] font-semibold whitespace-nowrap ${color}`}>{label}</dt>
      {children}
    </a>
  )
}

function StatValue({ value }: { value: number }) {
  return <dd className="font-display text-[32px] leading-none font-semibold tabular-nums text-malt-50">{value}</dd>
}
