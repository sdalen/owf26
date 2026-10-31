import type { Floor } from '../types'

export const floors: { floor: Floor; name: string; extras: string }[] = [
  { floor: 2, name: 'The Still Room', extras: 'Seminarrom Brøgger · Garderobe · Billettsalg' },
  { floor: 3, name: 'The Warehouse', extras: 'Seminarrom Ottersen · Castberg (Tutored Tasting) · Festivalbutikk' },
  { floor: 4, name: "The Angel's Share", extras: 'Takterrasse' },
]

export function bongerText(n: number): string {
  return `${n} ${n === 1 ? 'bong' : 'bonger'}`
}

/** Bong-retningslinjer fra festivalhåndboka: 1 bong per påbegynte kr 750 på Vinmonopolet */
export function bongPriceRange(bonger: number): string {
  if (bonger <= 1) return 'under kr 750'
  const from = (bonger - 1) * 750 + 1
  const to = bonger * 750
  return `kr ${from.toLocaleString('nb-NO')}–${to.toLocaleString('nb-NO')}`
}
