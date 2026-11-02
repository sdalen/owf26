import { Fragment, useState } from 'react'
import { StatusFilterBar } from '../components/StatusFilter'
import { TopBar } from '../components/TopBar'
import { WhiskyRow } from '../components/WhiskyRow'
import { floors } from '../data/floors'
import { allWhiskies } from '../data/lookup'
import { statsFor, wishOf } from '../noteStatus'
import { matchesStatus, useStatusFilter } from '../statusFilter'
import { exportListCsv } from '../listCsv'
import { exportListPdf } from '../listPdf'
import type { Notes, WhiskyNote } from '../types'
import { href, type ListShow } from '../useRoute'

type Sort = 'sted' | 'score' | 'bonger' | 'navn'

const sortLabels: Record<Sort, string> = {
  sted: 'Etasje og bar',
  score: 'Score',
  bonger: 'Bonger',
  navn: 'Navn',
}

interface Props {
  /** Forhåndsvalg fra forsiden: åpner lista med bare dette huket av */
  show?: ListShow
  notes: Notes
  onUpdate: (id: string, patch: Partial<WhiskyNote>) => void
}

const SORT_KEY = 'owf26-sort-min-liste'
const sorts: Sort[] = ['sted', 'score', 'bonger', 'navn']

const exportButton = 'rounded-full bg-malt-800 px-3 py-1 text-xs font-semibold text-malt-100 ring-1 ring-malt-700 transition hover:bg-malt-700 active:scale-95 disabled:opacity-60'

function loadSort(): Sort {
  try {
    const saved = localStorage.getItem(SORT_KEY)
    if (saved && saved in sortLabels) return saved as Sort
  } catch {
    // ignorer – bruk standard
  }
  return 'sted'
}

export function ListView({ show, notes, onUpdate }: Props) {
  const [sort, setSort] = useState<Sort>(loadSort)
  const [exporting, setExporting] = useState(false)
  // Kommer du fra et av kortene på forsiden, hukes bare det valget av
  const [filter, toggleFilter] = useStatusFilter(
    'owf26-min-liste-filter',
    { must: true, maybe: true, tasted: true },
    show && { must: show === 'must', maybe: show === 'maybe', tasted: show === 'tasted' },
  )

  function changeSort(s: Sort) {
    setSort(s)
    try {
      localStorage.setItem(SORT_KEY, s)
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

  // Alt som er markert må smake, kanskje eller smakt – avhukingen bestemmer hva som vises
  const all = sorted.filter((w) => wishOf(notes[w.id]) || notes[w.id]?.tasted)
  const visible = all.filter((w) => matchesStatus(notes[w.id], filter))
  const stats = statsFor(all, notes)
  const subtitle = `${stats.mustDone}/${stats.must} må · ${stats.maybeDone}/${stats.maybe} kanskje · ${stats.tasted} smakt`

  return (
    <>
      <TopBar title="Min liste" subtitle={subtitle} back={href({ view: 'home' })}>
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
        {all.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <StatusFilterBar filter={filter} onToggle={toggleFilter} />
            {visible.length > 0 && (
              <div className="ml-auto flex gap-1.5">
                <button type="button" onClick={() => exportListCsv(visible, notes)} className={exportButton}>
                  CSV ↓
                </button>
                <button
                  type="button"
                  disabled={exporting}
                  onClick={async () => {
                    setExporting(true)
                    try {
                      await exportListPdf(visible, notes)
                    } finally {
                      setExporting(false)
                    }
                  }}
                  className={exportButton}
                >
                  {exporting ? 'Lager PDF …' : 'PDF ↓'}
                </button>
              </div>
            )}
          </div>
        )}
      </TopBar>

      {all.length === 0 ? (
        <div className="py-16 text-center text-malt-300">
          <p>Ingenting på lista ennå.</p>
          <a href={href({ view: 'floors' })} className="mt-4 inline-block rounded-full bg-amber-400 px-4 py-2 font-semibold text-malt-950">
            Gå til barene
          </a>
        </div>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-malt-300">Ingenting å vise med disse valgene.</p>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((w, i) => (
            <Fragment key={w.id}>
              {sort === 'sted' && w.bar.floor !== visible[i - 1]?.bar.floor && <FloorHeading floor={w.bar.floor} />}
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
    <li className="px-1 pt-3 pb-0.5 text-xs font-semibold tracking-wide text-malt-300 uppercase">
      {floor}. etasje <span className="font-normal text-malt-500 normal-case">· {info?.name}</span>
    </li>
  )
}
