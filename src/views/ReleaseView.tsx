import { useState } from 'react'
import { TopBar } from '../components/TopBar'
import { BottleImage, vinmonopoletUrl } from '../components/WhiskyRow'
import { allWhiskies, type WhiskyWithBar } from '../data/lookup'
import { formatKr } from '../data/prices'
import { specialRelease } from '../data/specialRelease'
import { vinmonopolet } from '../data/vinmonopolet'
import { href } from '../useRoute'

/** Varenummer → whiskyen på festivalen som er koblet til samme flaske */
const atFestival = new Map<string, WhiskyWithBar>()
for (const w of allWhiskies) {
  const code = vinmonopolet[w.id]?.code
  if (code && !atFestival.has(code)) atFestival.set(code, w)
}

const pill = 'rounded-full px-2.5 py-1 ring-1 transition active:scale-95'

/** «Moestue Grape Selections AS» → «Moestue Grape Selections» */
const shortName = (importer: string) => importer.replace(/( Norway)? AS$/, '')

/** Importørene i slippet, flest varer først */
const importers = [...new Set(specialRelease.map((w) => w.importer).filter((i): i is string => !!i))].sort(
  (a, b) => specialRelease.filter((w) => w.importer === b).length - specialRelease.filter((w) => w.importer === a).length || a.localeCompare(b, 'nb'),
)

/** Hele Polets spesialslipp i november – det som også skjenkes på OWF lenker til baren */
export function ReleaseView() {
  const [importer, setImporter] = useState<string | null>(null)
  const shown = importer ? specialRelease.filter((w) => w.importer === importer) : specialRelease
  const onFestival = shown.filter((w) => atFestival.has(w.code)).length

  return (
    <>
      <TopBar title="Spesialslippet nov 26" subtitle={`${shown.length} whisky · ${onFestival} skjenkes på OWF`} back={href({ view: 'home' })}>
        <select
          value={importer ?? ''}
          onChange={(e) => setImporter(e.target.value || null)}
          aria-label="Importør"
          className={`w-full rounded-xl px-3 py-2.5 ring-1 outline-none focus:ring-2 focus:ring-amber-400/60 ${importer ? 'bg-amber-400/15 text-amber-100 ring-amber-400/50' : 'bg-malt-900 text-malt-50 ring-white/5'}`}
        >
          <option value="">Alle importører ({specialRelease.length})</option>
          {importers.map((i) => (
            <option key={i} value={i}>
              {shortName(i)} ({specialRelease.filter((w) => w.importer === i).length})
            </option>
          ))}
        </select>
      </TopBar>

      <p className="mb-4 text-sm text-malt-300">Whisky fra Vinmonopolets spesialslipp. Lanseres 12.11.26.</p>

      <ul className="space-y-2.5">
        {shown.map((w) => {
          const owf = atFestival.get(w.code)
          return (
            <li key={w.code} className={`card flex items-start gap-3 p-3.5 ${owf ? 'ring-amber-400/40' : ''}`}>
              <BottleImage vmp={w} />
              <div className="min-w-0 flex-1">
                <p className="text-base leading-snug font-semibold text-malt-50">{w.name}</p>
                <p className="mt-0.5 text-xs text-malt-300">{[w.region ?? w.country, w.abv, `${w.volumeCl} cl`, formatKr(Math.round(w.price))].filter(Boolean).join(' · ')}</p>
                {w.importer && <p className="mt-0.5 text-xs text-malt-500">Importør: {w.importer}</p>}
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
