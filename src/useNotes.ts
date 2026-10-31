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

/** Brukerens markeringer, rating og lenker – lagres i localStorage */
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
      const empty = !next.wantToTaste && !next.tasted && !next.rating && !next.whiskybaseUrl
      const { [id]: _removed, ...rest } = prev
      return empty ? rest : { ...rest, [id]: next }
    })
  }, [])

  return { notes, update, replaceAll: setNotes }
}
