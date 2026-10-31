import { useCallback, useEffect, useState } from 'react'
import type { Notes, WhiskyNote } from './types'

const STORAGE_KEY = 'owf26-notes'

function load(): Notes {
  try {
    return migrate(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Notes)
  } catch {
    return {}
  }
}

/** Eldre versjoner lagret Whiskybase-lenker – de er fjernet, og notater som da blir tomme ryddes bort */
export function migrate(notes: Notes): Notes {
  const result: Notes = {}
  for (const [id, note] of Object.entries(notes)) {
    const { whiskybaseUrl: _url, whiskybaseId: _id, ...rest } = note as WhiskyNote & { whiskybaseUrl?: string; whiskybaseId?: number }
    if (!isEmpty(rest)) result[id] = rest
  }
  return result
}

function isEmpty(n: WhiskyNote): boolean {
  return !n.wantToTaste && !n.maybe && !n.tasted && !n.rating && !n.tastingNote
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
      const { [id]: _removed, ...rest } = prev
      return isEmpty(next) ? rest : { ...rest, [id]: next }
    })
  }, [])

  return { notes, update, replaceAll: setNotes }
}
