import { useEffect } from 'react'
import { BarCard } from '../components/BarCard'
import { TopBar } from '../components/TopBar'
import { barById } from '../data/lookup'
import type { Floor, Notes, WhiskyNote } from '../types'
import { href } from '../useRoute'

interface Props {
  barId: string
  whiskyId?: string
  notes: Notes
  onUpdate: (id: string, patch: Partial<WhiskyNote>) => void
}

export function BarView({ barId, whiskyId, notes, onUpdate }: Props) {
  const bar = barById.get(barId)

  // Kommer du fra en lenke til en bestemt whisky, scroll dit
  useEffect(() => {
    if (whiskyId) document.getElementById(`whisky-${whiskyId}`)?.scrollIntoView({ block: 'center' })
  }, [whiskyId])
  if (!bar) {
    return (
      <>
        <TopBar title="Fant ikke baren" back={href({ view: 'floors' })} />
        <p className="text-malt-300">Denne baren finnes ikke i håndboka.</p>
      </>
    )
  }

  return (
    <>
      <TopBar title={bar.name} subtitle={`${bar.floor}. etasje`} back={href({ view: 'floor', floor: bar.floor as Floor })} />
      <BarCard key={bar.id} bar={bar} whiskies={bar.whiskies} notes={notes} onUpdate={onUpdate} highlightId={whiskyId} />
    </>
  )
}
