import { NavButton } from '../components/NavButton'
import { StatusCounts } from '../components/StatusCounts'
import { TopBar } from '../components/TopBar'
import { bars } from '../data/bars'
import { floors } from '../data/floors'
import { statsFor } from '../noteStatus'
import type { Notes } from '../types'
import { href } from '../useRoute'

export function FloorsView({ notes }: { notes: Notes }) {
  return (
    <>
      <TopBar title="Barer" subtitle="Velg etasje" back={href({ view: 'home' })} />
      <div className="space-y-2">
        {floors.map((f) => {
          const floorBars = bars.filter((b) => b.floor === f.floor)
          const whiskies = floorBars.flatMap((b) => b.whiskies)
          return (
            <NavButton
              key={f.floor}
              href={href({ view: 'floor', floor: f.floor })}
              icon={<span className="font-display font-semibold">{f.floor}</span>}
              title={f.name}
              subtitle={`${f.floor}. etasje · ${floorBars.length} barer · ${whiskies.length} whisky`}
              aside={<StatusCounts stats={statsFor(whiskies, notes)} />}
            />
          )
        })}
      </div>
    </>
  )
}
