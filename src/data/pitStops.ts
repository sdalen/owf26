import type { PitStopDay } from '../types'

// Tidspunkter fra festivalhåndboka (norsk vintertid, UTC+1)
export const PIT_STOPS: { day: PitStopDay; label: string; start: Date; end: Date }[] = [
  { day: 'fre', label: 'fredag', start: new Date('2026-11-06T18:30:00+01:00'), end: new Date('2026-11-06T19:00:00+01:00') },
  { day: 'lør', label: 'lørdag', start: new Date('2026-11-07T16:30:00+01:00'), end: new Date('2026-11-07T17:00:00+01:00') },
]
