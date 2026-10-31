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
    <section className="rounded-xl border border-malt-900 bg-malt-900/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Bonger</h2>
          <p className="text-xs text-malt-300">Hvor mange har du kjøpt?</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="En bong mindre" className="size-9 rounded-full bg-malt-900 text-lg hover:bg-malt-700">
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={bought}
            onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            aria-label="Antall kjøpte bonger"
            className="w-16 rounded-md border border-malt-700 bg-malt-950 py-1 text-center text-lg font-semibold tabular-nums outline-none focus:ring-2 focus:ring-malt-500"
          />
          <button type="button" onClick={() => step(1)} aria-label="En bong til" className="size-9 rounded-full bg-malt-900 text-lg hover:bg-malt-700">
            +
          </button>
        </div>
      </div>

      {bought > 0 && (
        <>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <dt className="text-xs text-malt-300">Kjøpt</dt>
              <dd className="text-xl font-semibold tabular-nums">{bought}</dd>
            </div>
            <div>
              <dt className="text-xs text-malt-300">Brukt</dt>
              <dd className="text-xl font-semibold tabular-nums">{stats.tastedBonger}</dd>
            </div>
            <div>
              <dt className="text-xs text-malt-300">Igjen</dt>
              <dd className={`text-xl font-semibold tabular-nums ${left < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{left}</dd>
            </div>
          </dl>
          {stats.mustBongerLeft > 0 && (
            <p className={`mt-3 rounded-md px-3 py-2 text-sm ${missingForMust > 0 ? 'bg-red-900/40 text-red-200' : 'bg-emerald-900/30 text-emerald-200'}`}>
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
