import type { Bar, Whisky } from '../types'
import { bars } from './bars'

export interface WhiskyWithBar extends Whisky {
  bar: Bar
}

export const allWhiskies: WhiskyWithBar[] = bars.flatMap((bar) => bar.whiskies.map((w) => ({ ...w, bar })))

export const whiskyById = new Map(allWhiskies.map((w) => [w.id, w]))

export const barById = new Map(bars.map((b) => [b.id, b]))
