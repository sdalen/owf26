import { bongerText } from '../data/floors'
import { allWhiskies } from '../data/lookup'
import { PIT_STOPS } from '../data/pitStops'
import { BONGER_PER_DAY } from '../data/prices'
import { type Stats, wishOf } from '../noteStatus'
import { hasPitStopBong } from '../pitStopBongs'
import type { Notes, PitStopDay } from '../types'
import { href } from '../useRoute'

interface Props {
  /** Antall dager på billetten: 0 (ikke valgt), 1 eller 2 */
  ticketDays: number
  onTicketDaysChange: (days: number) => void
  /** Bonger kjøpt i tillegg til det som følger med billetten */
  extra: number
  onExtraChange: (n: number) => void
  stats: Stats
  notes: Notes
  usedPitStopBongs: PitStopDay[]
}

export function BongCounter({ ticketDays, onTicketDaysChange, extra, onExtraChange, stats, notes, usedPitStopBongs }: Props) {
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
        <>
          <p className="mt-2 text-xs text-malt-300">
            {ticketDays * BONGER_PER_DAY} bonger + {ticketDays === 1 ? '1 pit-stop-bong (fredag eller lørdag)' : '1 pit-stop-bong hver dag'}
          </p>
          {/* Kun visning – bongen brukes automatisk når en pit-stop-dram markeres som smakt */}
          <div className="mt-2 flex flex-wrap gap-2">
            {(ticketDays === 1 && usedPitStopBongs.length === 0 ? [null] : PIT_STOPS.filter((p) => hasPitStopBong(p.day, ticketDays, usedPitStopBongs))).map((p) => {
              const used = p !== null && usedPitStopBongs.includes(p.day)
              const dram = p && allWhiskies.find((w) => notes[w.id]?.tasted && notes[w.id]?.pitStopBong === p.day)
              return (
                <span
                  key={p?.day ?? 'en'}
                  className={`${p ? `pit-${p.day}` : ''} flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
                    used ? 'bg-pit-400/10 text-pit-300/80 ring-pit-400/20' : 'bg-pit-400/15 text-pit-200 ring-pit-400/40'
                  }`}
                >
                  <span className="shrink-0">Pit-stop-bong{p ? ` ${p.label}` : ''}</span>
                  <span className={`truncate ${used ? 'rounded-full bg-pit-400 px-1.5 text-malt-950' : 'font-medium text-pit-300/70'}`}>
                    {used ? `✓ ${dram?.name ?? 'brukt'}` : 'ubrukt'}
                  </span>
                </span>
              )
            })}
          </div>
        </>
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
                ? `«Vil smake» trenger ${bongerText(stats.mustBongerLeft)} – du mangler ${missingForMust}.`
                : `«Vil smake» trenger ${bongerText(stats.mustBongerLeft)} – det går fint.${
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
      <PitStopOverview ticketDays={ticketDays} notes={notes} />
    </section>
  )
}

/**
 * Pit-stop-bongen gjelder én pit-stop-dram (én per dag på 2-dagersbillett, én totalt på 1-dagsbillett).
 * Har du flere pit-stop-drammer på lista enn bongene dekker, vises de her.
 */
function PitStopOverview({ ticketDays, notes }: { ticketDays: number; notes: Notes }) {
  const days = PIT_STOPS.map((p) => ({ ...p, drams: allWhiskies.filter((w) => w.pitStop?.includes(p.day) && wishOf(notes[w.id])) }))
  const total = days.reduce((sum, d) => sum + d.drams.length, 0)
  const oneDayTooMany = ticketDays === 1 && total > 1
  const shown = days.filter((d) => d.drams.length > 1 || (oneDayTooMany && d.drams.length > 0))
  if (shown.length === 0) return null

  return (
    <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
      <p className="text-sm text-malt-100">
        {oneDayTooMany
          ? `Du har ${total} pit-stop-drammer på lista, men 1-dagsbilletten har bare én pit-stop-bong.`
          : 'Du har flere pit-stop-drammer på lista samme dag, men pit-stop-bongen gjelder bare én per dag.'}
      </p>
      {shown.map((d) => (
        <div key={d.day} className={`pit-${d.day}`}>
          <p className="text-xs font-semibold tracking-wide text-pit-300 uppercase">
            Pit-stop {d.label} · {d.drams.length} på lista
          </p>
          <ul className="mt-1.5 space-y-1">
            {d.drams.map((w) => {
              const note = notes[w.id]
              return (
                <li key={w.id}>
                  <a href={href({ view: 'bar', barId: w.bar.id, whiskyId: w.id })} className="flex items-baseline gap-2 text-sm hover:text-pit-100">
                    <span className={`w-4 shrink-0 text-center ${note?.tasted ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {note?.tasted ? '✓' : wishOf(note) === 'must' ? '♥' : '?'}
                    </span>
                    <span className="min-w-0 flex-1 text-malt-50">{w.name}</span>
                    <span className="shrink-0 text-xs text-malt-500">
                      {w.bar.name} · {w.bar.floor}. etg
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
