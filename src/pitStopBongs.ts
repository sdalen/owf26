import { useEffect, useState } from 'react'
import { PIT_STOPS } from './data/pitStops'
import type { PitStopDay } from './types'

const STORAGE_KEY = 'owf26-pitstop-bong-brukt'

/** Dagene pit-stop-bongen er brukt – lagres i localStorage */
export function usePitStopBongs() {
  const [used, setUsed] = useState<PitStopDay[]>(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      return Array.isArray(parsed) ? parsed.filter((d): d is PitStopDay => d === 'fre' || d === 'lør') : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(used))
    } catch {
      // lagring utilgjengelig – gjelder bare denne økta
    }
  }, [used])

  const toggle = (day: PitStopDay) => setUsed((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  const markUsed = (day: PitStopDay) => setUsed((prev) => (prev.includes(day) ? prev : [...prev, day]))

  return { used, toggle, markUsed }
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
