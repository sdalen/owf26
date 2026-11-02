import { type ReactNode, useState } from 'react'
import { bongPriceRange } from '../data/floors'
import { formatKr } from '../data/prices'
import { vinmonopolet } from '../data/vinmonopolet'
import { wishOf } from '../noteStatus'
import type { Bar, VmpInfo, Whisky, WhiskyNote } from '../types'
import { href } from '../useRoute'
import { ScoreInput } from './ScoreInput'

interface Props {
  whisky: Whisky
  note?: WhiskyNote
  onUpdate: (patch: Partial<WhiskyNote>) => void
  /** Vises i lister på tvers av barer, f.eks. «Min liste» */
  bar?: Bar
  /** Kort fremheving når man kommer fra en lenke til akkurat denne whiskyen */
  highlight?: boolean
}

/** Liten pille-knapp for status – diskré til den er valgt */
function StatusButton({ on, onClick, children, onClass }: { on: boolean; onClick: () => void; children: ReactNode; onClass: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 transition active:scale-95 ${
        on ? `${onClass} ring-transparent` : 'text-malt-300 ring-malt-700 hover:text-malt-50 hover:ring-malt-500'
      }`}
    >
      {children}
    </button>
  )
}

const actionButton = 'rounded-full bg-malt-800 px-2.5 py-1 text-malt-100 ring-1 ring-malt-700 transition hover:bg-malt-700 active:scale-95'

/** Kortets ramme og bakgrunn viser status: smakt (grønn), må smake (rav), kanskje (svak rav) */
const cardStatus = {
  tasted: 'ring-emerald-400/50 bg-[color-mix(in_oklab,var(--color-malt-900),var(--color-emerald-400)_6%)]',
  must: 'ring-amber-400/50 bg-[color-mix(in_oklab,var(--color-malt-900),var(--color-amber-400)_6%)]',
  maybe: 'ring-amber-200/25',
}

export function WhiskyRow({ whisky, note = {}, onUpdate, bar, highlight }: Props) {
  const { wantToTaste, maybe, tasted, score, tastingNote } = note
  const [editingNote, setEditingNote] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const wish = wishOf(note)
  const status = tasted ? 'tasted' : wish
  const vmp = vinmonopolet[whisky.id]
  // Pris, styrke og region står allerede under navnet – panelet vises bare når det har mer å by på
  const hasDetails = !!vmp && !!(vmp.color || vmp.smell || vmp.taste || vmp.method || vmp.profile)

  return (
    <li id={`whisky-${whisky.id}`} className={`card p-3.5 ${status ? cardStatus[status] : ''} ${highlight ? 'animate-highlight' : ''}`}>
      <div className="flex items-start gap-3">
        <BottleImage vmp={vmp} />
        <div className="min-w-0 flex-1">
          <p className="text-base leading-snug font-semibold text-malt-50">{whisky.name}</p>
          {vmp && <p className="mt-0.5 text-xs text-malt-300">{[vmp.region ?? vmp.country, vmp.abv, `${vmp.volumeCl} cl`, formatKr(Math.round(vmp.price))].filter(Boolean).join(' · ')}</p>}
          {(bar || whisky.nominee || whisky.pitStop) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {bar && (
                <a href={href({ view: 'bar', barId: bar.id })} className="text-xs font-medium text-malt-100 underline decoration-malt-700 underline-offset-2 hover:decoration-malt-300">
                  {bar.name} · {bar.floor}. etg
                </a>
              )}
              {whisky.nominee && <Label className="bg-orange-400/10 text-orange-300 ring-orange-400/30">Nominert</Label>}
              {whisky.pitStop?.map((day) => (
                <Label key={day} className={`bg-pit-400/10 text-pit-300 ring-pit-400/30 pit-${day}`}>
                  Pit-stop {day === 'fre' ? 'fre 18:30' : 'lør 16:30'}
                </Label>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-center" title={`Vinmonopolpris ${bongPriceRange(whisky.bonger)}`}>
          <span className="flex size-11 items-center justify-center rounded-full bg-amber-400/15 font-display text-xl leading-none font-semibold tabular-nums text-amber-200 ring-1 ring-amber-400/30">
            {whisky.bonger}
          </span>
          <span className="mt-1 text-[10px] tracking-wide text-malt-500 uppercase">{whisky.bonger === 1 ? 'bong' : 'bonger'}</span>
        </div>
      </div>

      {/* Må smake og kanskje utelukker hverandre */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusButton on={!!wantToTaste} onClick={() => onUpdate({ wantToTaste: !wantToTaste, maybe: false })} onClass="bg-amber-400 text-malt-950">
          {wantToTaste ? '♥' : '♡'} Må smake
        </StatusButton>
        <StatusButton on={!!maybe && !wantToTaste} onClick={() => onUpdate({ maybe: !maybe, wantToTaste: false })} onClass="bg-amber-200 text-malt-950">
          ? Kanskje
        </StatusButton>
        <StatusButton on={!!tasted} onClick={() => onUpdate({ tasted: !tasted })} onClass="bg-emerald-400 text-malt-950">
          ✓ Smakt
        </StatusButton>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* Å gi score betyr at du har smakt den */}
        <ScoreInput value={score} onChange={(s) => onUpdate(s === undefined ? { score: undefined } : { score: s, tasted: true })} />
        <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
          {!editingNote && !tastingNote && (
            <button type="button" onClick={() => setEditingNote(true)} className={actionButton}>
              + Notat
            </button>
          )}
          {hasDetails && (
            <button type="button" aria-expanded={showInfo} onClick={() => setShowInfo(!showInfo)} className={`${actionButton} ${showInfo ? 'bg-malt-700' : ''}`}>
              Info {showInfo ? '▴' : '▾'}
            </button>
          )}
          {vmp && (
            <a href={vinmonopoletUrl(vmp.code)} target="_blank" rel="noreferrer" title={vmp.name} className={actionButton}>
              VMP ↗
            </a>
          )}
        </div>
      </div>

      {hasDetails && showInfo && <VmpDetails info={vmp} />}

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

function Label({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap uppercase ring-1 ${className}`}>{children}</span>
}

function VmpDetails({ info }: { info: VmpInfo }) {
  const lines = [
    ['Farge', info.color],
    ['Lukt', info.smell],
    ['Smak', info.taste],
    ['Metode', info.method],
  ].filter((l): l is [string, string] => !!l[1])
  return (
    <div className="mt-2.5 rounded-xl bg-malt-950/70 px-3 py-2.5 text-sm ring-1 ring-white/5">
      {lines.length > 0 && (
        <dl className="space-y-1.5">
          {lines.map(([label, text]) => (
            <div key={label}>
              <dt className="inline text-xs font-semibold tracking-wide text-malt-500 uppercase">{label} </dt>
              <dd className="inline text-malt-100">{text}</dd>
            </div>
          ))}
        </dl>
      )}
      {info.profile && (
        <ul className={`grid grid-cols-2 gap-x-4 gap-y-1.5 ${lines.length > 0 ? 'mt-2.5' : ''}`}>
          {info.profile.map((p) => (
            <li key={p.name} className="text-xs text-malt-300">
              <div className="flex justify-between">
                <span>{p.name}</span>
                <span className="tabular-nums">{p.value}/12</span>
              </div>
              <div className="mt-0.5 h-1 rounded-full bg-malt-800">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${(p.value / 12) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Flaskebilde fra Polet – caches av service workeren. Plassholder når bilde mangler, så navnene står på linje. */
function BottleImage({ vmp }: { vmp?: VmpInfo }) {
  const [failed, setFailed] = useState(false)
  if (!vmp || failed) return <span aria-hidden className="h-20 w-14 shrink-0 rounded-lg bg-malt-800/60" />
  return (
    <img
      src={`https://bilder.vinmonopolet.no/cache/96x96-0/${vmp.code}-1.jpg`}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-20 w-14 shrink-0 rounded-lg bg-white object-contain p-0.5"
    />
  )
}

/** Kort-URL-en videresender til produktsiden */
function vinmonopoletUrl(code: string): string {
  return `https://www.vinmonopolet.no/p/${code}`
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
