import { Fragment, type ReactNode, useState } from 'react'
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
const FILTER_KEY = 'owf26-min-liste-filter'

type Filter = { must: boolean; maybe: boolean; tasted: boolean }
const allOn: Filter = { must: true, maybe: true, tasted: true }

function loadFilter(): Filter {
  try {
    return { ...allOn, ...(JSON.parse(localStorage.getItem(FILTER_KEY) ?? '{}') as Partial<Filter>) }
  } catch {
    return allOn
  }
}

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
  const [filter, setFilter] = useState<Filter>(loadFilter)
  const sorts: Sort[] = mode === 'tasted' ? ['score', 'sted', 'bonger', 'navn'] : ['sted', 'bonger', 'navn']

  function changeSort(s: Sort) {
    setSort(s)
    try {
      localStorage.setItem(`${SORT_KEY}-${mode}`, s)
    } catch {
      // ikke kritisk
    }
  }

  function toggleFilter(key: keyof Filter) {
    const next = { ...filter, [key]: !filter[key] }
    setFilter(next)
    try {
      localStorage.setItem(FILTER_KEY, JSON.stringify(next))
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

  // «Min liste» er én samlet liste: alt som er markert må smake, kanskje eller smakt
  const groups: { title?: string; items: WhiskyWithBar[] }[] =
    mode === 'wishlist'
      ? [{ items: sorted.filter((w) => wishOf(notes[w.id]) || notes[w.id]?.tasted) }]
      : mode === 'maybe'
        ? [{ items: sorted.filter((w) => wishOf(notes[w.id]) === 'maybe') }]
        : [{ items: sorted.filter((w) => notes[w.id]?.tasted) }]
  const all = groups.flatMap((g) => g.items)
  const stats = statsFor(all, notes)

  // Avhukingen på «Min liste»: smakte styres av «Smakt», resten av hvilket ønske de har
  const visibleGroups =
    mode === 'wishlist'
      ? groups.map((g) => ({
          ...g,
          items: g.items.filter((w) => {
            const note = notes[w.id]
            if (note?.tasted) return filter.tasted
            const wish = wishOf(note)
            return !!wish && filter[wish]
          }),
        }))
      : groups

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
      <TopBar title={{ wishlist: 'Min liste', maybe: 'Kanskje', tasted: 'Har smakt' }[mode]} subtitle={subtitle} back={href({ view: 'home' })}>
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
        {mode === 'wishlist' && all.length > 0 && (
          <div className="mt-2 flex gap-1.5">
            <FilterToggle on={filter.must} onClick={() => toggleFilter('must')} onClass="bg-amber-400 text-malt-950">
              Må smake
            </FilterToggle>
            <FilterToggle on={filter.maybe} onClick={() => toggleFilter('maybe')} onClass="bg-amber-200 text-malt-950">
              Kanskje
            </FilterToggle>
            <FilterToggle on={filter.tasted} onClick={() => toggleFilter('tasted')} onClass="bg-emerald-400 text-malt-950">
              Smakt
            </FilterToggle>
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
          {visibleGroups.every((g) => g.items.length === 0) && <p className="py-12 text-center text-malt-300">Ingenting å vise med disse valgene.</p>}
          {visibleGroups
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <section key={g.title ?? 'all'}>
                {g.title && (
                  <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
                    <h2 className="font-display text-xl font-semibold">{g.title}</h2>
                    <span className="text-xs text-malt-300">{groupSummary(g.items)}</span>
                  </div>
                )}
                <ul className="space-y-2.5">
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

function FilterToggle({ on, onClick, onClass, children }: { on: boolean; onClick: () => void; onClass: string; children: ReactNode }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition active:scale-95 ${
        on ? `${onClass} ring-transparent` : 'text-malt-300 ring-malt-700 hover:text-malt-50'
      }`}
    >
      <span aria-hidden>{on ? '☑' : '☐'}</span>
      {children}
    </button>
  )
}

function FloorHeading({ floor }: { floor: number }) {
  const info = floors.find((f) => f.floor === floor)
  return (
    <li className="px-1 pt-3 pb-0.5 text-xs font-semibold tracking-wide text-malt-300 uppercase">
      {floor}. etasje <span className="font-normal text-malt-500 normal-case">· {info?.name}</span>
    </li>
  )
}
