import { type ReactNode, useState } from 'react'
import { bongPriceRange } from '../data/floors'
import { wishOf } from '../noteStatus'
import type { Bar, Whisky, WhiskyNote } from '../types'
import { href } from '../useRoute'
import { whiskybaseSearchUrl } from '../whiskybase'
import { ScoreInput } from './ScoreInput'

interface Props {
  whisky: Whisky
  note?: WhiskyNote
  onUpdate: (patch: Partial<WhiskyNote>) => void
  /** Vises i lister på tvers av barer, f.eks. «Vil smake» */
  bar?: Bar
}

function Segment({ on, onClick, children, onClass }: { on: boolean; onClick: () => void; children: ReactNode; onClass: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition active:scale-95 ${
        on ? `${onClass} shadow-sm shadow-black/30` : 'text-malt-300 hover:bg-malt-800 hover:text-malt-50'
      }`}
    >
      {children}
    </button>
  )
}

const stripe = { must: 'bg-amber-400', maybe: 'bg-amber-200/40' }

export function WhiskyRow({ whisky, note = {}, onUpdate, bar }: Props) {
  const { wantToTaste, maybe, tasted, score, tastingNote } = note
  const [editingNote, setEditingNote] = useState(false)
  const wish = wishOf(note)

  return (
    <li className="relative px-4 py-3.5">
      {/* Tynn stripe til venstre viser status uten å farge hele raden */}
      {(tasted || wish) && <span aria-hidden className={`absolute inset-y-3 left-0 w-[3px] rounded-r-full ${tasted ? 'bg-emerald-400' : stripe[wish!]}`} />}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] leading-snug font-medium text-malt-50">
            {tasted && (
              <span className="mr-1.5 inline-flex size-[18px] items-center justify-center rounded-full bg-emerald-400 align-[-3px] text-[11px] font-bold text-malt-950" aria-label="Smakt">
                ✓
              </span>
            )}
            {whisky.name}
          </p>
          {(bar || whisky.nominee || whisky.pitStop) && (
            <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-malt-300">
              {bar && (
                <a href={href({ view: 'bar', barId: bar.id })} className="font-medium text-malt-100 underline decoration-malt-700 underline-offset-2 hover:decoration-malt-300">
                  {bar.name} · {bar.floor}. etg
                </a>
              )}
              {whisky.nominee && <Tag className="text-orange-300">Nominert</Tag>}
              {whisky.pitStop?.map((day) => (
                <Tag key={day} className={`text-pit-300 pit-${day}`}>
                  Pit-stop {day === 'fre' ? 'fre 18:30' : 'lør 16:30'}
                </Tag>
              ))}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right" title={`Vinmonopolpris ${bongPriceRange(whisky.bonger)}`}>
          <p className="font-display text-xl leading-none font-semibold tabular-nums text-amber-200">{whisky.bonger}</p>
          <p className="mt-0.5 text-[10px] tracking-wide text-malt-500 uppercase">{whisky.bonger === 1 ? 'bong' : 'bonger'}</p>
        </div>
      </div>

      {/* Må smake og kanskje utelukker hverandre */}
      <div className="mt-3 inline-flex gap-0.5 rounded-xl bg-malt-950/70 p-1 ring-1 ring-white/5">
        <Segment on={!!wantToTaste} onClick={() => onUpdate({ wantToTaste: !wantToTaste, maybe: false })} onClass="bg-amber-400 text-malt-950">
          {wantToTaste ? '♥' : '♡'} Må smake
        </Segment>
        <Segment on={!!maybe && !wantToTaste} onClick={() => onUpdate({ maybe: !maybe, wantToTaste: false })} onClass="bg-amber-200/20 text-amber-100">
          ? Kanskje
        </Segment>
        <Segment on={!!tasted} onClick={() => onUpdate({ tasted: !tasted })} onClass="bg-emerald-400 text-malt-950">
          ✓ Smakt
        </Segment>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        {/* Å gi score betyr at du har smakt den */}
        <ScoreInput value={score} onChange={(s) => onUpdate(s === undefined ? { score: undefined } : { score: s, tasted: true })} />
        <div className="flex items-center gap-4 text-xs font-medium text-malt-500">
          {!editingNote && !tastingNote && (
            <button type="button" onClick={() => setEditingNote(true)} className="hover:text-malt-100">
              + Notat
            </button>
          )}
          <a href={whiskybaseSearchUrl(whisky.name)} target="_blank" rel="noreferrer" className="hover:text-malt-100">
            Søk WB ↗
          </a>
        </div>
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
            className="mt-2.5 block w-full border-l-2 border-amber-400/40 py-0.5 pl-3 text-left font-display text-sm whitespace-pre-wrap text-malt-100 italic hover:border-amber-400"
          >
            {tastingNote}
          </button>
        )
      )}
    </li>
  )
}

function Tag({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium ${className}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
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
        className="w-full rounded-xl bg-malt-950 px-3 py-2 text-sm ring-1 ring-malt-700 outline-none focus:ring-2 focus:ring-amber-400/60"
      />
    </div>
  )
}
