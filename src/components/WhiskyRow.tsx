import { bongPriceRange } from '../data/floors'
import type { Whisky, WhiskyNote } from '../types'
import { StarRating } from './StarRating'
import { WhiskybaseLink } from './WhiskybaseLink'

interface Props {
  whisky: Whisky
  note?: WhiskyNote
  onUpdate: (patch: Partial<WhiskyNote>) => void
}

export function WhiskyRow({ whisky, note = {}, onUpdate }: Props) {
  const { wantToTaste, rating, whiskybaseUrl } = note

  return (
    <li className={`flex gap-3 px-4 py-3 ${wantToTaste ? 'bg-amber-400/10' : ''}`}>
      <button
        type="button"
        onClick={() => onUpdate({ wantToTaste: !wantToTaste })}
        aria-pressed={!!wantToTaste}
        title={wantToTaste ? 'Fjern fra smakeliste' : 'Vil smake'}
        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-sm transition-colors ${
          wantToTaste ? 'border-amber-400 bg-amber-400 text-malt-950' : 'border-malt-700 text-malt-700 hover:border-amber-400 hover:text-amber-400'
        }`}
      >
        ✓
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium leading-snug">{whisky.name}</p>
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

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <StarRating value={rating} onChange={(r) => onUpdate({ rating: r })} />
          <WhiskybaseLink name={whisky.name} url={whiskybaseUrl} onChange={(url) => onUpdate({ whiskybaseUrl: url })} />
        </div>
      </div>
    </li>
  )
}
