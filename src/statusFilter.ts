import { useState } from 'react'
import { wishOf } from './noteStatus'
import type { WhiskyNote } from './types'

/** Avhuking for må smake, kanskje og smakt – brukes på «Min liste» og barsidene */
export type StatusFilter = { must: boolean; maybe: boolean; tasted: boolean }

/** Lagrer valgene i localStorage under `storageKey`, så de huskes til neste gang */
export function useStatusFilter(storageKey: string, initial: StatusFilter) {
  const [filter, setFilter] = useState<StatusFilter>(() => {
    try {
      return { ...initial, ...(JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Partial<StatusFilter>) }
    } catch {
      return initial
    }
  })

  function toggle(key: keyof StatusFilter) {
    const next = { ...filter, [key]: !filter[key] }
    setFilter(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // ikke kritisk
    }
  }

  return [filter, toggle] as const
}

/** Smakte styres av «Smakt», resten av hvilket ønske de har */
export function matchesStatus(note: WhiskyNote | undefined, filter: StatusFilter): boolean {
  if (note?.tasted) return filter.tasted
  const wish = wishOf(note)
  return !!wish && filter[wish]
}
