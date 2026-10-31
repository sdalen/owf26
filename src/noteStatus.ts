import type { Notes, Whisky, WhiskyNote } from './types'

/** Hvilken del av «Vil smake» whiskyen hører til – uavhengig av om den er smakt */
export function wishOf(note: WhiskyNote | undefined): 'must' | 'maybe' | null {
  if (note?.wantToTaste) return 'must'
  if (note?.maybe) return 'maybe'
  return null
}

export interface Stats {
  must: number
  mustDone: number
  maybe: number
  maybeDone: number
  tasted: number
  /** Bonger for det som gjenstår å smake */
  mustBongerLeft: number
  maybeBongerLeft: number
  tastedBonger: number
  /** Bonger for alt på «Vil smake» (må + kanskje), og hvor mye av det som er smakt */
  wishBonger: number
  wishBongerDone: number
}

export function statsFor(whiskies: Whisky[], notes: Notes): Stats {
  const s: Stats = { must: 0, mustDone: 0, maybe: 0, maybeDone: 0, tasted: 0, mustBongerLeft: 0, maybeBongerLeft: 0, tastedBonger: 0, wishBonger: 0, wishBongerDone: 0 }
  for (const w of whiskies) {
    const note = notes[w.id]
    const wish = wishOf(note)
    const tasted = !!note?.tasted
    if (tasted) {
      s.tasted++
      s.tastedBonger += w.bonger
    }
    if (wish) {
      s.wishBonger += w.bonger
      if (tasted) s.wishBongerDone += w.bonger
    }
    if (wish === 'must') {
      s.must++
      if (tasted) s.mustDone++
      else s.mustBongerLeft += w.bonger
    } else if (wish === 'maybe') {
      s.maybe++
      if (tasted) s.maybeDone++
      else s.maybeBongerLeft += w.bonger
    }
  }
  return s
}
