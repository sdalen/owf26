import { useCallback, useEffect, useState } from 'react'
import type { Notes, WhiskyNote } from './types'

const STORAGE_KEY = 'owf26-notes'

function load(): Notes {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Notes
  } catch {
    return {}
  }
}

function isEmpty(n: WhiskyNote): boolean {
  return !n.wantToTaste && !n.maybe && !n.tasted && n.score === undefined && !n.tastingNote
}

/** Brukerens markeringer, score og notater – lagres i localStorage */
export function useNotes() {
  const [notes, setNotes] = useState<Notes>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch {
      // Lagring utilgjengelig (privat modus o.l.) – appen fungerer fortsatt i minnet
    }
  }, [notes])

  const update = useCallback((id: string, patch: Partial<WhiskyNote>) => {
    setNotes((prev) => {
      const next: WhiskyNote = { ...prev[id], ...patch }
      const { [id]: _removed, ...rest } = prev
      return isEmpty(next) ? rest : { ...rest, [id]: next }
    })
  }, [])

  return { notes, update, replaceAll: setNotes }
}
