import { useState } from 'react'
import { TopBar } from '../components/TopBar'
import { BottleImage, vinmonopoletUrl } from '../components/WhiskyRow'
import { allWhiskies, type WhiskyWithBar } from '../data/lookup'
import { formatKr } from '../data/prices'
import { allocations, ONLINE_STORE, releaseStores } from '../data/releaseAllocation'
import { specialRelease } from '../data/specialRelease'
import { vinmonopolet } from '../data/vinmonopolet'
import { useStoredNumber } from '../useStoredNumber'
import { href } from '../useRoute'

/** Varenummer → whiskyen på festivalen som er koblet til samme flaske */
const atFestival = new Map<string, WhiskyWithBar>()
for (const w of allWhiskies) {
  const code = vinmonopolet[w.id]?.code
  if (code && !atFestival.has(code)) atFestival.set(code, w)
}

const pill = 'rounded-full px-2.5 py-1 ring-1 transition active:scale-95'
const tag = 'rounded-full px-2.5 py-1 ring-1'
const select = 'w-full rounded-xl px-3 py-2.5 ring-1 outline-none focus:ring-2 focus:ring-amber-400/60'
const selectState = (active: boolean) => (active ? 'bg-amber-400/15 text-amber-100 ring-amber-400/50' : 'bg-malt-900 text-malt-50 ring-white/5')

/** «Moestue Grape Selections AS» → «Moestue Grape Selections» */
const shortName = (importer: string) => importer.replace(/( Norway)? AS$/, '')

/** Importørene i slippet, flest varer først */
const importers = [...new Set(specialRelease.map((w) => w.importer).filter((i): i is string => !!i))].sort(
  (a, b) => specialRelease.filter((w) => w.importer === b).length - specialRelease.filter((w) => w.importer === a).length || a.localeCompare(b, 'nb'),
)

/** Antall flasker av varen som kommer til polet (0 hvis ingen) */
const countAt = (code: string, store: number) => allocations[code]?.stores[store] ?? 0

/** Hvor mange av whiskyene som kommer til polet */
const whiskiesAt = (store: number) => specialRelease.filter((w) => countAt(w.code, store) > 0).length

/** Hele Polets spesialslipp i november – det som også skjenkes på OWF lenker til baren */
export function ReleaseView() {
  const [importer, setImporter] = useState<string | null>(null)
  const [storeId, setStoreId] = useStoredNumber('owf26-slipp-pol')
  const store = releaseStores.find((s) => s.id === storeId)
  const atStore = store ? (store.id === ONLINE_STORE ? 'i nettbutikken' : `på ${store.name}`) : ''

  const byImporter = importer ? specialRelease.filter((w) => w.importer === importer) : specialRelease
  // Med valgt pol: det som kommer dit først, flest flasker øverst
  const shown = store ? [...byImporter].sort((a, b) => countAt(b.code, store.id) - countAt(a.code, store.id)) : byImporter
  const onFestival = shown.filter((w) => atFestival.has(w.code)).length
  const comingToStore = store ? shown.filter((w) => countAt(w.code, store.id) > 0).length : 0

  const subtitle = [`${shown.length} whisky`, store && `${comingToStore} ${atStore}`, `${onFestival} skjenkes på OWF`].filter(Boolean).join(' · ')

  return (
    <>
      <TopBar title="Spesialslippet nov 26" subtitle={subtitle} back={href({ view: 'home' })}>
        <div className="grid gap-2 sm:grid-cols-2">
          <select value={storeId || ''} onChange={(e) => setStoreId(Number(e.target.value) || 0)} aria-label="Ditt pol" className={`${select} ${selectState(!!store)}`}>
            <option value="">Velg pol eller nettbutikk</option>
            {releaseStores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({whiskiesAt(s.id)})
              </option>
            ))}
          </select>
          <select value={importer ?? ''} onChange={(e) => setImporter(e.target.value || null)} aria-label="Importør" className={`${select} ${selectState(!!importer)}`}>
            <option value="">Alle importører ({specialRelease.length})</option>
            {importers.map((i) => (
              <option key={i} value={i}>
                {shortName(i)} ({specialRelease.filter((w) => w.importer === i).length})
              </option>
            ))}
          </select>
        </div>
      </TopBar>

      <p className="mb-4 text-sm text-malt-300">
        Whisky fra Vinmonopolets spesialslipp. Lanseres 12.11.26 på disse polene og i nettbutikken. Antall og kvotering er fra Polets lanseringsliste.
      </p>

      <ul className="space-y-2.5">
        {shown.map((w) => {
          const owf = atFestival.get(w.code)
          const alloc = allocations[w.code]
          const here = store ? countAt(w.code, store.id) : 0
          const missing = !!store && here === 0
          return (
            <li key={w.code} className={`card flex items-start gap-3 p-3.5 ${owf ? 'ring-amber-400/40' : ''} ${missing ? 'opacity-60' : ''}`}>
              <BottleImage vmp={w} />
              <div className="min-w-0 flex-1">
                <p className="text-base leading-snug font-semibold text-malt-50">{w.name}</p>
                <p className="mt-0.5 text-xs text-malt-300">{[w.region ?? w.country, w.abv, `${w.volumeCl} cl`, formatKr(Math.round(w.price))].filter(Boolean).join(' · ')}</p>
                {w.importer && <p className="mt-0.5 text-xs text-malt-500">Importør: {w.importer}</p>}
                {alloc && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    {store ? (
                      <span className={`${tag} ${missing ? 'bg-malt-900 text-malt-400 ring-white/5' : 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/40'}`}>
                        {missing ? `Kommer ikke ${store.id === ONLINE_STORE ? 'i nettbutikken' : `til ${store.name}`}` : `${here} stk ${atStore}`}
                      </span>
                    ) : (
                      <span className={`${tag} bg-malt-900 text-malt-200 ring-white/5`}>
                        {alloc.total} stk totalt{alloc.stores[ONLINE_STORE] ? ` · ${alloc.stores[ONLINE_STORE]} på nett` : ''}
                      </span>
                    )}
                    {alloc.quota && <span className={`${tag} bg-rose-400/15 text-rose-200 ring-rose-400/40`}>{alloc.quota}</span>}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  {owf && (
                    <a href={href({ view: 'bar', barId: owf.bar.id, whiskyId: owf.id })} className={`${pill} bg-amber-400/15 text-amber-200 ring-amber-400/40 hover:bg-amber-400/25`}>
                      På OWF · {owf.bar.name}, {owf.bar.floor}. etg
                    </a>
                  )}
                  <a href={vinmonopoletUrl(w.code)} target="_blank" rel="noreferrer" className={`${pill} bg-malt-800 text-malt-100 ring-malt-700 hover:bg-malt-700`}>
                    VMP ↗
                  </a>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
