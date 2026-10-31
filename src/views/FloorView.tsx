import { NavButton } from '../components/NavButton'
import { TopBar } from '../components/TopBar'
import { bars } from '../data/bars'
import { floors } from '../data/floors'
import type { Floor, Notes } from '../types'
import { href } from '../useRoute'

export function FloorView({ floor, notes }: { floor: Floor; notes: Notes }) {
  const info = floors.find((f) => f.floor === floor)!

  return (
    <>
      <TopBar title={`${floor}. etasje · ${info.name}`} subtitle={info.extras} back={href({ view: 'floors' })} />
      <div className="space-y-3">
        {bars
          .filter((b) => b.floor === floor)
          .map((b) => {
            const wanted = b.whiskies.filter((w) => notes[w.id]?.wantToTaste && !notes[w.id]?.tasted).length
            const tasted = b.whiskies.filter((w) => notes[w.id]?.tasted).length
            return (
              <NavButton
                key={b.id}
                href={href({ view: 'bar', barId: b.id })}
                title={b.name}
                subtitle={`${b.whiskies.length} whisky${b.distributor !== b.name ? ` · ${b.distributor}` : ''}`}
                aside={
                  <div className="text-sm font-medium">
                    {wanted > 0 && <p className="text-amber-400">{wanted} vil smake</p>}
                    {tasted > 0 && <p className="text-emerald-400">{tasted} smakt</p>}
                  </div>
                }
              />
            )
          })}
      </div>
    </>
  )
}
