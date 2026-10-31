import { Fragment, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { WhiskyRow } from '../components/WhiskyRow'
import { floors } from '../data/floors'
import { allWhiskies } from '../data/lookup'
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

  const items = allWhiskies
    .filter((w) =>
      mode === 'wishlist'
        ? // Smakte whiskyer flyttes over til «Har smakt»
          notes[w.id]?.wantToTaste && !notes[w.id]?.tasted
        : notes[w.id]?.tasted,
    )
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
  const bonger = items.reduce((sum, w) => sum + w.bonger, 0)

  return (
    <>
      <TopBar
        title={mode === 'wishlist' ? 'Vil smake' : 'Har smakt'}
        subtitle={`${items.length} whisky · ${bonger} bonger${mode === 'tasted' ? ' brukt' : ''}`}
        back={href({ view: 'home' })}
      >
        {items.length > 1 && (
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

      {items.length === 0 ? (
        <div className="py-16 text-center text-malt-300">
          <p>{mode === 'wishlist' ? 'Ingenting på lista ennå.' : 'Du har ikke markert noe som smakt ennå.'}</p>
          <a href={href({ view: 'floors' })} className="mt-3 inline-block text-amber-400 underline underline-offset-2">
            Gå til barene
          </a>
        </div>
      ) : (
        <ul className="divide-y divide-malt-900 overflow-hidden rounded-xl border border-malt-900 bg-malt-900/40">
          {items.map((w, i) => (
            <Fragment key={w.id}>
              {sort === 'sted' && w.bar.floor !== items[i - 1]?.bar.floor && <FloorHeading floor={w.bar.floor} />}
              <WhiskyRow whisky={w} note={notes[w.id]} onUpdate={(patch) => onUpdate(w.id, patch)} bar={w.bar} />
            </Fragment>
          ))}
        </ul>
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
