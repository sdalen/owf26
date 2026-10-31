import { NavButton } from '../components/NavButton'
import { TopBar } from '../components/TopBar'
import { bars } from '../data/bars'
import { floors } from '../data/floors'
import type { Notes } from '../types'
import { href } from '../useRoute'

export function FloorsView({ notes }: { notes: Notes }) {
  return (
    <>
      <TopBar title="Barer" subtitle="Velg etasje" back={href({ view: 'home' })} />
      <div className="space-y-3">
        {floors.map((f) => {
          const floorBars = bars.filter((b) => b.floor === f.floor)
          const whiskies = floorBars.flatMap((b) => b.whiskies)
          const wanted = whiskies.filter((w) => notes[w.id]?.wantToTaste && !notes[w.id]?.tasted).length
          return (
            <NavButton
              key={f.floor}
              href={href({ view: 'floor', floor: f.floor })}
              title={`${f.floor}. etasje · ${f.name}`}
              subtitle={`${floorBars.length} barer · ${whiskies.length} whisky`}
              aside={wanted > 0 && <span className="text-sm font-medium text-amber-400">{wanted} vil smake</span>}
            />
          )
        })}
      </div>
    </>
  )
}
