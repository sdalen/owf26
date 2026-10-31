import { useState } from 'react'
import { bongPriceRange } from '../data/floors'
import { wishOf } from '../noteStatus'
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
  const { wantToTaste, maybe, tasted, rating, whiskybaseUrl, tastingNote } = note
  const [editingNote, setEditingNote] = useState(false)
  const wish = wishOf(note)

  return (
    <li className={`px-4 py-3 ${tasted ? 'bg-emerald-400/5' : wish === 'must' ? 'bg-amber-400/10' : wish === 'maybe' ? 'bg-amber-400/5' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-medium leading-snug ${tasted ? 'text-malt-300' : ''}`}>
            {tasted && (
              <span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-emerald-400 align-[-2px] text-xs text-malt-950" aria-label="Smakt">
                ✓
              </span>
            )}
            {whisky.name}
          </p>
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

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {/* Må smake og kanskje utelukker hverandre */}
        <Toggle
          on={!!wantToTaste}
          onClick={() => onUpdate({ wantToTaste: !wantToTaste, maybe: false })}
          label={wantToTaste ? '♥ Må smake' : '♡ Må smake'}
          onClass="border-amber-400 bg-amber-400 text-malt-950"
        />
        <Toggle
          on={!!maybe && !wantToTaste}
          onClick={() => onUpdate({ maybe: !maybe, wantToTaste: false })}
          label="? Kanskje"
          onClass="border-amber-200/60 bg-amber-200/20 text-amber-100"
        />
        <Toggle on={!!tasted} onClick={() => onUpdate({ tasted: !tasted })} label="✓ Smakt" onClass="border-emerald-400 bg-emerald-400 text-malt-950" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Å gi rating betyr at du har smakt den */}
        <StarRating value={rating} onChange={(r) => onUpdate(r ? { rating: r, tasted: true } : { rating: undefined })} />
        <WhiskybaseLink name={whisky.name} url={whiskybaseUrl} onChange={(url) => onUpdate({ whiskybaseUrl: url })} />
        {!editingNote && !tastingNote && (
          <button type="button" onClick={() => setEditingNote(true)} className="text-sm text-malt-500 hover:text-malt-100">
            + Notat
          </button>
        )}
      </div>

      {editingNote ? (
        <TastingNoteEditor
          initial={tastingNote ?? ''}
          onDone={(text) => {
            onUpdate({ tastingNote: text || undefined })
            setEditingNote(false)
          }}
        />
      ) : (
        tastingNote && (
          <button
            type="button"
            onClick={() => setEditingNote(true)}
            title="Endre notat"
            className="mt-2 block w-full rounded-md bg-malt-900/60 px-3 py-2 text-left text-sm whitespace-pre-wrap text-malt-100 italic hover:bg-malt-900"
          >
            {tastingNote}
          </button>
        )
      )}
    </li>
  )
}

function TastingNoteEditor({ initial, onDone }: { initial: string; onDone: (text: string) => void }) {
  const [text, setText] = useState(initial)
  return (
    <div className="mt-2">
      <textarea
        autoFocus
        rows={3}
        maxLength={1000}
        value={text}
        onChange={(e) => setText(e.target.value)}
        // Lagres også når feltet mister fokus, så ingenting går tapt
        onBlur={() => onDone(text.trim())}
        placeholder="Nese, smak, finish …"
        className="w-full rounded-md border border-malt-700 bg-malt-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-malt-500"
      />
    </div>
  )
}
