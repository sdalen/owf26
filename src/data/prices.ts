/** Billettpriser og bonger fra festivalen 2026 */
export const TICKET_PRICE: Record<number, number> = { 1: 695, 2: 1045 }

/** Billetten gir 10 bonger per dag, og én pit-stop-bong per dag */
export const BONGER_PER_DAY = 10

/** Pris per ekstra bong */
export const BONG_PRICE = 35

export function formatKr(n: number): string {
  return `${n.toLocaleString('nb-NO')} kr`
}
