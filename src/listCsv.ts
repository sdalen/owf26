import type { WhiskyWithBar } from './data/lookup'
import { vinmonopolet } from './data/vinmonopolet'
import { wishOf } from './noteStatus'
import { formatScore } from './score'
import type { Notes } from './types'

// Semikolon og desimalkomma, så fila åpnes rett i norsk Excel/Numbers
const cell = (v: string | number | undefined) => {
  const s = v === undefined ? '' : typeof v === 'number' ? String(v).replace('.', ',') : v
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Laster ned whiskyene som vises på «Min liste» som CSV, i samme rekkefølge */
export function exportListCsv(whiskies: WhiskyWithBar[], notes: Notes): void {
  const header = ['Nr', 'Whisky', 'Smakt', 'Score', 'Notat', 'Bar', 'Etasje', 'Bonger', 'Ønske', 'Nominert', 'Land', 'Region', 'Styrke', 'Pris (kr)', 'Volum (cl)', 'Varenummer']
  const rows = whiskies.map((w, i) => {
    const note = notes[w.id]
    const vmp = vinmonopolet[w.id]
    const wish = wishOf(note)
    return [
      i + 1,
      w.name,
      note?.tasted ? 'Ja' : 'Nei',
      note?.score !== undefined ? formatScore(note.score) : undefined,
      note?.tastingNote,
      w.bar.name,
      w.bar.floor,
      w.bonger,
      wish === 'must' ? 'Vil smake' : wish === 'maybe' ? 'Kanskje' : undefined,
      w.nominee ? 'Ja' : undefined,
      vmp?.country,
      vmp?.region,
      vmp?.abv,
      vmp?.price,
      vmp?.volumeCl,
      vmp?.code,
    ]
  })
  const csv = '﻿' + [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n')

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'owf26-min-liste.csv'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
