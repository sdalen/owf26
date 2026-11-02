import type { WhiskyWithBar } from './data/lookup'
import { formatKr } from './data/prices'
import { vinmonopolet } from './data/vinmonopolet'
import { wishOf } from './noteStatus'
import { formatScore } from './score'
import type { Notes } from './types'

const MARGIN = 16
const PAGE_HEIGHT = 297
const WIDTH = 210 - MARGIN * 2

// Standardfontene i jsPDF støtter æøå, men ikke smale mellomrom fra toLocaleString
const clean = (s: string) => s.replace(/[  ]/g, ' ')

/** Lager en PDF av whiskyene som vises på «Min liste», i samme rekkefølge. jsPDF lastes først ved behov. */
export async function exportListPdf(whiskies: WhiskyWithBar[], notes: Notes): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const scored = whiskies.map((w) => notes[w.id]?.score).filter((s): s is number => s !== undefined)
  const average = scored.length > 0 ? scored.reduce((a, b) => a + b, 0) / scored.length : undefined
  const date = new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })

  let y = MARGIN + 4
  doc.setFont('helvetica', 'bold').setFontSize(18).text('Oslo Whiskyfestival 2026', MARGIN, y)
  y += 7
  doc
    .setFont('helvetica', 'normal')
    .setFontSize(10)
    .setTextColor(110)
    .text(clean(`Min liste · ${whiskies.length} whisky${average !== undefined ? ` · snitt ${formatScore(average)}` : ''} · ${date}`), MARGIN, y)
  y += 8

  whiskies.forEach((w, i) => {
    const note = notes[w.id]
    const vmp = vinmonopolet[w.id]
    const wish = wishOf(note)
    const status = note?.tasted ? 'Smakt' : wish === 'must' ? 'Må smake' : wish === 'maybe' ? 'Kanskje' : undefined
    const details = [status, `${w.bar.name} · ${w.bar.floor}. etg`, `${w.bonger} ${w.bonger === 1 ? 'bong' : 'bonger'}`, vmp?.region ?? vmp?.country, vmp?.abv, vmp && formatKr(Math.round(vmp.price))]
      .filter(Boolean)
      .join(' · ')
    doc.setFont('helvetica', 'normal').setFontSize(10)
    const noteLines: string[] = note?.tastingNote ? doc.splitTextToSize(clean(note.tastingNote), WIDTH - 8) : []
    doc.setFont('helvetica', 'bold').setFontSize(12)
    const nameLines: string[] = doc.splitTextToSize(clean(`${i + 1}. ${w.name}`), WIDTH - 24)
    const height = nameLines.length * 5 + 5 + noteLines.length * 4.6 + (noteLines.length ? 2 : 0) + 5

    if (y + height > PAGE_HEIGHT - MARGIN) {
      doc.addPage()
      y = MARGIN + 4
    }

    doc.setTextColor(20).text(nameLines, MARGIN, y)
    doc.text(note?.score !== undefined ? `${formatScore(note.score)}/10` : '–', MARGIN + WIDTH, y, { align: 'right' })
    y += nameLines.length * 5
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(110).text(clean(details), MARGIN, y)
    y += 5
    if (noteLines.length) {
      doc.setFont('helvetica', 'italic').setFontSize(10).setTextColor(40).text(noteLines, MARGIN + 4, y)
      y += noteLines.length * 4.6 + 2
    }
    doc.setDrawColor(220).line(MARGIN, y - 1.5, MARGIN + WIDTH, y - 1.5)
    y += 4
  })

  doc.save('owf26-min-liste.pdf')
}
