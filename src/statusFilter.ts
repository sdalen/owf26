import { useState } from 'react'
import { wishOf } from './noteStatus'
import type { WhiskyNote } from './types'

/** Avhuking for må smake, kanskje og smakt – brukes på «Min liste» og barsidene */
export type StatusFilter = { must: boolean; maybe: boolean; tasted: boolean }

/** Lagrer valgene i localStorage under `storageKey`, så de huskes til neste gang. `preset` overstyrer det lagrede. */
export function useStatusFilter(storageKey: string, initial: StatusFilter, preset?: StatusFilter) {
  const [filter, setFilter] = useState<StatusFilter>(() => {
    if (preset) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(preset))
      } catch {
        // ikke kritisk
      }
      return preset
    }
    try {
      return { ...initial, ...(JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Partial<StatusFilter>) }
    } catch {
      return initial
    }
  })

  function save(next: StatusFilter) {
    setFilter(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // ikke kritisk
    }
  }

  const toggle = (key: keyof StatusFilter) => save({ ...filter, [key]: !filter[key] })

  return [filter, toggle] as const
}

/** Smakte styres av «Smakt», resten av hvilket ønske de har */
export function matchesStatus(note: WhiskyNote | undefined, filter: StatusFilter): boolean {
  if (note?.tasted) return filter.tasted
  const wish = wishOf(note)
  return !!wish && filter[wish]
}
