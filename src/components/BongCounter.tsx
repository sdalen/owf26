import { bongerText } from '../data/floors'
import type { Stats } from '../noteStatus'

interface Props {
  bought: number
  onChange: (n: number) => void
  stats: Stats
}

export function BongCounter({ bought, onChange, stats }: Props) {
  const left = bought - stats.tastedBonger
  const missingForMust = stats.mustBongerLeft - left
  const step = (delta: number) => onChange(Math.max(0, bought + delta))

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg leading-tight font-semibold">Bonger</h2>
          <p className="text-xs text-malt-300">Hvor mange har du kjøpt?</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="En bong mindre" className="size-9 rounded-full bg-white/5 text-lg text-malt-100 ring-1 ring-white/5 hover:bg-white/10 active:scale-95">
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={bought}
            onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            aria-label="Antall kjøpte bonger"
            className="w-14 rounded-lg bg-malt-950 py-1 text-center font-display font-display text-2xl font-semibold tabular-nums ring-1 ring-malt-700 outline-none focus:ring-2 focus:ring-amber-400/60"
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
              <dt className="text-[11px] tracking-wide text-malt-500 uppercase">Kjøpt</dt>
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
