import { Fragment, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { WhiskyRow } from '../components/WhiskyRow'
import { bongerText, floors } from '../data/floors'
import { allWhiskies, type WhiskyWithBar } from '../data/lookup'
import { statsFor, wishOf } from '../noteStatus'
import type { Notes, WhiskyNote } from '../types'
import { href } from '../useRoute'

type Sort = 'sted' | 'score' | 'bonger' | 'navn'

const sortLabels: Record<Sort, string> = {
  sted: 'Etasje og bar',
  score: 'Score',
  bonger: 'Bonger',
  navn: 'Navn',
}

interface Props {
  mode: 'wishlist' | 'maybe' | 'tasted'
  notes: Notes
  onUpdate: (id: string, patch: Partial<WhiskyNote>) => void
}

const SORT_KEY = 'owf26-sort'

function loadSort(mode: Props['mode']): Sort {
  try {
    const saved = localStorage.getItem(`${SORT_KEY}-${mode}`)
    if (saved && saved in sortLabels) return saved as Sort
  } catch {
    // ignorer – bruk standard
  }
  return mode === 'tasted' ? 'score' : 'sted'
}

export function ListView({ mode, notes, onUpdate }: Props) {
  const [sort, setSort] = useState<Sort>(() => loadSort(mode))
  const sorts: Sort[] = mode === 'tasted' ? ['score', 'sted', 'bonger', 'navn'] : ['sted', 'bonger', 'navn']

  function changeSort(s: Sort) {
    setSort(s)
    try {
      localStorage.setItem(`${SORT_KEY}-${mode}`, s)
    } catch {
      // ikke kritisk
    }
  }

  const sorted = [...allWhiskies]
    // allWhiskies ligger allerede i etasje/bar-rekkefølge, så 'sted' trenger bare stabil sortering på etasje
    .sort((a, b) => {
      switch (sort) {
        case 'score':
          return (notes[b.id]?.score ?? -1) - (notes[a.id]?.score ?? -1)
        case 'bonger':
          return b.bonger - a.bonger
        case 'navn':
          return a.name.localeCompare(b.name, 'nb')
        default:
          return a.bar.floor - b.bar.floor
      }
    })

  // «Vil smake» deles i «Må smake» og «Kanskje». Smakte blir stående (med hake) så man beholder oversikten.
  const groups: { title?: string; items: WhiskyWithBar[] }[] =
    mode === 'wishlist'
      ? [
          { title: 'Må smake', items: sorted.filter((w) => wishOf(notes[w.id]) === 'must') },
          { title: 'Kanskje', items: sorted.filter((w) => wishOf(notes[w.id]) === 'maybe') },
        ]
      : mode === 'maybe'
        ? [{ items: sorted.filter((w) => wishOf(notes[w.id]) === 'maybe') }]
        : [{ items: sorted.filter((w) => notes[w.id]?.tasted) }]
  const all = groups.flatMap((g) => g.items)
  const stats = statsFor(all, notes)

  const groupSummary = (items: WhiskyWithBar[]) => {
    const left = items.filter((w) => !notes[w.id]?.tasted)
    return `${items.length - left.length}/${items.length} smakt · ${bongerText(left.reduce((sum, w) => sum + w.bonger, 0))} igjen`
  }

  const subtitle =
    mode === 'wishlist'
      ? `${stats.mustDone}/${stats.must} må · ${stats.maybeDone}/${stats.maybe} kanskje smakt · ${bongerText(stats.mustBongerLeft + stats.maybeBongerLeft)} igjen`
      : mode === 'maybe'
        ? `${stats.maybeDone}/${stats.maybe} smakt · ${bongerText(stats.maybeBongerLeft)} igjen`
        : `${stats.tasted} whisky · ${bongerText(stats.tastedBonger)} brukt`

  return (
    <>
      <TopBar title={{ wishlist: 'Vil smake', maybe: 'Kanskje', tasted: 'Har smakt' }[mode]} subtitle={subtitle} back={href({ view: 'home' })}>
        {all.length > 1 && (
          <div className="flex gap-1 rounded-xl bg-malt-900 p-1 text-sm ring-1 ring-white/5">
            {sorts.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changeSort(s)}
                className={`flex-1 rounded-lg py-1.5 font-medium whitespace-nowrap ${sort === s ? 'bg-malt-700 text-malt-50 shadow-sm' : 'text-malt-300 hover:text-malt-50'}`}
              >
                {sortLabels[s]}
              </button>
            ))}
          </div>
        )}
      </TopBar>

      {all.length === 0 ? (
        <div className="py-16 text-center text-malt-300">
          <p>{mode === 'tasted' ? 'Du har ikke markert noe som smakt ennå.' : 'Ingenting på lista ennå.'}</p>
          <a href={href({ view: 'floors' })} className="mt-4 inline-block rounded-full bg-amber-400 px-4 py-2 font-semibold text-malt-950">
            Gå til barene
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {groups
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <section key={g.title ?? 'all'}>
                {g.title && (
                  <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
                    <h2 className="font-display text-xl font-semibold">{g.title}</h2>
                    <span className="text-xs text-malt-300">{groupSummary(g.items)}</span>
                  </div>
                )}
                <ul className="card divide-y divide-white/5 overflow-hidden">
                  {g.items.map((w, i) => (
                    <Fragment key={w.id}>
                      {sort === 'sted' && w.bar.floor !== g.items[i - 1]?.bar.floor && <FloorHeading floor={w.bar.floor} />}
                      <WhiskyRow whisky={w} note={notes[w.id]} onUpdate={(patch) => onUpdate(w.id, patch)} bar={w.bar} />
                    </Fragment>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </>
  )
}

function FloorHeading({ floor }: { floor: number }) {
  const info = floors.find((f) => f.floor === floor)
  return (
    <li className="bg-malt-950/40 px-4 pt-3 pb-1.5 text-xs font-semibold tracking-wide text-malt-300 uppercase">
      {floor}. etasje <span className="font-normal text-malt-500 normal-case">· {info?.name}</span>
    </li>
  )
}
