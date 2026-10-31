import { Fragment, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { WhiskyRow } from '../components/WhiskyRow'
import { bongerText, floors } from '../data/floors'
import { allWhiskies, type WhiskyWithBar } from '../data/lookup'
import { statsFor, wishOf } from '../noteStatus'
import type { Notes, WhiskyNote } from '../types'
import { href } from '../useRoute'

type Sort = 'sted' | 'rating' | 'bonger' | 'navn'

const sortLabels: Record<Sort, string> = {
  sted: 'Etasje og bar',
  rating: 'Rating',
  bonger: 'Bonger',
  navn: 'Navn',
}

interface Props {
  mode: 'wishlist' | 'tasted'
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
  return mode === 'wishlist' ? 'sted' : 'rating'
}

export function ListView({ mode, notes, onUpdate }: Props) {
  const [sort, setSort] = useState<Sort>(() => loadSort(mode))
  const sorts: Sort[] = mode === 'wishlist' ? ['sted', 'bonger', 'navn'] : ['rating', 'sted', 'bonger', 'navn']

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
        case 'rating':
          return (notes[b.id]?.rating ?? 0) - (notes[a.id]?.rating ?? 0)
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
      : `${stats.tasted} whisky · ${bongerText(stats.tastedBonger)} brukt`

  return (
    <>
      <TopBar title={mode === 'wishlist' ? 'Vil smake' : 'Har smakt'} subtitle={subtitle} back={href({ view: 'home' })}>
        {all.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-malt-300">Sorter:</span>
            {sorts.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changeSort(s)}
                className={`rounded-full px-3 py-1 ${sort === s ? 'bg-malt-100 text-malt-950' : 'bg-malt-900 text-malt-100 hover:bg-malt-700'}`}
              >
                {sortLabels[s]}
              </button>
            ))}
          </div>
        )}
      </TopBar>

      {all.length === 0 ? (
        <div className="py-16 text-center text-malt-300">
          <p>{mode === 'wishlist' ? 'Ingenting på lista ennå.' : 'Du har ikke markert noe som smakt ennå.'}</p>
          <a href={href({ view: 'floors' })} className="mt-3 inline-block text-amber-400 underline underline-offset-2">
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
                  <h2 className="mb-2 text-lg font-semibold">
                    {g.title} <span className="text-sm font-normal text-malt-300">· {groupSummary(g.items)}</span>
                  </h2>
                )}
                <ul className="divide-y divide-malt-900 overflow-hidden rounded-xl border border-malt-900 bg-malt-900/40">
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
    <li className="bg-malt-900 px-4 py-2 text-sm font-semibold">
      <span className="text-malt-300">{floor}. etasje ·</span> {info?.name}
    </li>
  )
}
