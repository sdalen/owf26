export type Floor = 2 | 3 | 4

export type PitStopDay = 'fre' | 'lør'

export interface Whisky {
  id: string
  name: string
  /** Antall bonger for en 2 cl smaksprøve */
  bonger: number
  section?: string
  /** Nominert i «Best i festival» */
  nominee?: boolean
  pitStop?: PitStopDay[]
}

export interface Bar {
  id: string
  name: string
  distributor: string
  floor: number
  whiskies: Whisky[]
}

/** Det brukeren selv har lagt inn for en whisky */
export interface WhiskyNote {
  /** «Må smake» – høyeste prioritet */
  wantToTaste?: boolean
  /** «Kanskje» – smakes hvis det er bonger og tid igjen */
  maybe?: boolean
  tasted?: boolean
  rating?: number
  tastingNote?: string
}

export type Notes = Record<string, WhiskyNote>
