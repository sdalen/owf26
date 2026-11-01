import { PIT_STOPS } from './data/pitStops'
import type { Notes, PitStopDay } from './types'

/** Dagene pit-stop-bongen er brukt – utledet fra pit-stop-drammer markert som smakt */
export function usedPitStopBongs(notes: Notes): PitStopDay[] {
  return PIT_STOPS.map((p) => p.day).filter((day) => Object.values(notes).some((n) => n.tasted && n.pitStopBong === day))
}

/**
 * Har du en pit-stop-bong for denne dagen? 2-dagersbillett gir én hver dag;
 * 1-dagsbillett gir én totalt, som er tilgjengelig helt til den er brukt en av dagene.
 */
export function hasPitStopBong(day: PitStopDay, ticketDays: number, used: PitStopDay[]): boolean {
  if (ticketDays === 2) return true
  if (ticketDays === 1) return used.length === 0 || used.includes(day)
  return false
}

const HOUR = 60 * 60 * 1000

/**
 * Hvilken ubrukt pit-stop-bong som brukes når en pit-stop-dram markeres som smakt, eller null om ingen.
 * Noen drammer er pit-stop begge dager: da velges dagen med pit-stop nå (eller nylig), ellers første ledige dag.
 */
export function pitStopBongDayFor(dramDays: PitStopDay[], ticketDays: number, used: PitStopDay[], time: Date): PitStopDay | null {
  const free = dramDays.filter((d) => !used.includes(d) && hasPitStopBong(d, ticketDays, used))
  const current = PIT_STOPS.find((p) => free.includes(p.day) && time.getTime() >= p.start.getTime() - HOUR && time.getTime() <= p.end.getTime() + 2 * HOUR)
  return current?.day ?? free[0] ?? null
}
