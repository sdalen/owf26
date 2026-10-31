import { bongPriceRange } from '../data/floors'
import type { Bar, Whisky, WhiskyNote } from '../types'
import { href } from '../useRoute'
import { StarRating } from './StarRating'
import { WhiskybaseLink } from './WhiskybaseLink'

interface Props {
  whisky: Whisky
  note?: WhiskyNote
  onUpdate: (patch: Partial<WhiskyNote>) => void
  /** Vises i lister på tvers av barer, f.eks. «Vil smake» */
  bar?: Bar
}

function Toggle({ on, onClick, label, onClass }: { on: boolean; onClick: () => void; label: string; onClass: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
        on ? onClass : 'border-malt-700 text-malt-300 hover:border-malt-500 hover:text-malt-100'
      }`}
    >
      {label}
    </button>
  )
}

export function WhiskyRow({ whisky, note = {}, onUpdate, bar }: Props) {
  const { wantToTaste, tasted, rating, whiskybaseUrl } = note

  return (
    <li className={`px-4 py-3 ${tasted ? 'bg-emerald-400/5' : wantToTaste ? 'bg-amber-400/10' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium leading-snug">{whisky.name}</p>
          {bar && (
            <a
              href={href({ view: 'bar', barId: bar.id })}
              className="mt-1 inline-flex items-center gap-1 rounded-md bg-malt-900 px-2 py-0.5 text-sm text-malt-100 hover:bg-malt-700"
            >
              <span className="font-medium">{bar.name}</span>
              <span className="text-malt-300">· {bar.floor}. etg</span>
            </a>
          )}
          {(whisky.nominee || whisky.pitStop) && (
            <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
              {whisky.nominee && <span className="rounded bg-orange-900/50 px-1.5 py-0.5 text-orange-200">Best i festival-nominert</span>}
              {whisky.pitStop?.map((day) => (
                <span key={day} className={`rounded px-1.5 py-0.5 ${day === 'fre' ? 'bg-sky-900/50 text-sky-200' : 'bg-emerald-900/50 text-emerald-200'}`}>
                  Pit-stop {day === 'fre' ? 'fredag 18:30' : 'lørdag 16:30'}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right" title={`Vinmonopolpris ${bongPriceRange(whisky.bonger)}`}>
          <p className="text-lg font-semibold tabular-nums leading-none text-malt-100">{whisky.bonger}</p>
          <p className="text-[11px] text-malt-500">{whisky.bonger === 1 ? 'bong' : 'bonger'}</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Toggle
          on={!!wantToTaste}
          onClick={() => onUpdate({ wantToTaste: !wantToTaste })}
          label={wantToTaste ? '♥ Vil smake' : '♡ Vil smake'}
          onClass="border-amber-400 bg-amber-400 text-malt-950"
        />
        <Toggle
          on={!!tasted}
          onClick={() => onUpdate({ tasted: !tasted })}
          label="✓ Smakt"
          onClass="border-emerald-400 bg-emerald-400 text-malt-950"
        />
        {/* Å gi rating betyr at du har smakt den */}
        <StarRating value={rating} onChange={(r) => onUpdate(r ? { rating: r, tasted: true } : { rating: undefined })} />
        <WhiskybaseLink name={whisky.name} url={whiskybaseUrl} onChange={(url) => onUpdate({ whiskybaseUrl: url })} />
      </div>
    </li>
  )
}
