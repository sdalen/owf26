import { bongerText } from '../data/floors'
import type { Stats } from '../noteStatus'

/** Billetten gir 10 bonger per dag, og én pit-stop-bong per dag */
const BONGER_PER_DAY = 10

interface Props {
  /** Antall dager på billetten: 0 (ikke valgt), 1 eller 2 */
  ticketDays: number
  onTicketDaysChange: (days: number) => void
  /** Bonger kjøpt i tillegg til det som følger med billetten */
  extra: number
  onExtraChange: (n: number) => void
  stats: Stats
}

export function BongCounter({ ticketDays, onTicketDaysChange, extra, onExtraChange, stats }: Props) {
  const bought = ticketDays * BONGER_PER_DAY + extra
  const left = bought - stats.tastedBonger
  const missingForMust = stats.mustBongerLeft - left
  const step = (delta: number) => onExtraChange(Math.max(0, extra + delta))

  return (
    <section className="card p-4">
      <h2 className="font-display text-lg leading-tight font-semibold">Bonger</h2>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-malt-300">Billett</p>
        <div className="flex gap-1 rounded-xl bg-malt-950/70 p-1 text-sm ring-1 ring-white/5">
          {[1, 2].map((days) => (
            <button
              key={days}
              type="button"
              aria-pressed={ticketDays === days}
              // Trykk på valgt billett igjen for å fjerne valget
              onClick={() => onTicketDaysChange(ticketDays === days ? 0 : days)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition active:scale-95 ${
                ticketDays === days ? 'bg-amber-400 text-malt-950 shadow-sm shadow-black/30' : 'text-malt-300 hover:bg-malt-800 hover:text-malt-50'
              }`}
            >
              {days === 1 ? '1 dag' : '2 dager'}
            </button>
          ))}
        </div>
      </div>

      {ticketDays > 0 && (
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-malt-300">
          <span>{ticketDays * BONGER_PER_DAY} bonger</span>
          <span className="text-malt-500">+</span>
          {ticketDays === 1 ? (
            <span className="font-medium text-pit-300">1 pit-stop-bong (fredag eller lørdag)</span>
          ) : (
            <>
              <span className="font-medium text-pit-300">1 pit-stop-bong fredag</span>
              <span className="text-malt-500">+</span>
              <span className="pit-lør font-medium text-pit-300">1 pit-stop-bong lørdag</span>
            </>
          )}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-malt-300">{ticketDays > 0 ? 'Ekstra kjøpt' : 'Kjøpt'}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="En bong mindre" className="size-9 rounded-full bg-white/5 text-lg text-malt-100 ring-1 ring-white/5 hover:bg-white/10 active:scale-95">
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={extra}
            onChange={(e) => onExtraChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            aria-label={ticketDays > 0 ? 'Antall ekstra bonger' : 'Antall kjøpte bonger'}
            className="w-14 rounded-lg bg-malt-950 py-1 text-center font-display text-2xl font-semibold tabular-nums ring-1 ring-malt-700 outline-none focus:ring-2 focus:ring-amber-400/60"
          />
          <button type="button" onClick={() => step(1)} aria-label="En bong til" className="size-9 rounded-full bg-white/5 text-lg text-malt-100 ring-1 ring-white/5 hover:bg-white/10 active:scale-95">
            +
          </button>
        </div>
      </div>

      {bought > 0 && (
        <>
          <dl className="mt-4 grid grid-cols-3 divide-x divide-white/5 rounded-xl bg-malt-950/50 py-2.5 text-center">
            <div>
              <dt className="text-[11px] tracking-wide text-malt-500 uppercase">Totalt</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums">{bought}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-malt-500 uppercase">Brukt</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums">{stats.tastedBonger}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-malt-500 uppercase">Igjen</dt>
              <dd className={`font-display text-2xl font-semibold tabular-nums ${left < 0 ? 'text-red-400' : 'text-emerald-300'}`}>{left}</dd>
            </div>
          </dl>
          {stats.mustBongerLeft > 0 && (
            <p className={`mt-3 text-sm ${missingForMust > 0 ? 'text-red-300' : 'text-emerald-200/90'}`}>
              {missingForMust > 0
                ? `«Må smake» trenger ${bongerText(stats.mustBongerLeft)} – du mangler ${missingForMust}.`
                : `«Må smake» trenger ${bongerText(stats.mustBongerLeft)} – det går fint.${
                    stats.maybeBongerLeft > 0
                      ? stats.mustBongerLeft + stats.maybeBongerLeft <= left
                        ? ' Det er nok til alle på «Kanskje» også.'
                        : ` ${left - stats.mustBongerLeft} igjen til «Kanskje» (trenger ${stats.maybeBongerLeft}).`
                      : ''
                  }`}
            </p>
          )}
        </>
      )}
    </section>
  )
}
