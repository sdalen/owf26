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

/** Produktinfo fra Vinmonopolet for flasken whiskyen er matchet mot */
export interface VmpInfo {
  /** Varenummer hos Vinmonopolet */
  code: string
  name: string
  price: number
  volumeCl: number
  abv?: string
  country?: string
  region?: string
  category?: string
  color?: string
  smell?: string
  taste?: string
  method?: string
  /** Fylde, fat, røyk, sødme osv. på en skala fra 0 til 12 */
  profile?: { name: string; value: number }[]
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
  /** «Vil smake» – høyeste prioritet */
  wantToTaste?: boolean
  /** «Kanskje» – smakes hvis det er bonger og tid igjen */
  maybe?: boolean
  tasted?: boolean
  /** 0–10 med én desimal */
  score?: number
  tastingNote?: string
  /** Pit-stop-bongen som ble brukt på denne dramen – settes automatisk når en pit-stop-dram markeres som smakt */
  pitStopBong?: PitStopDay
}

export type Notes = Record<string, WhiskyNote>
