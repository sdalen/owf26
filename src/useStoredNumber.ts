import { useEffect, useState } from 'react'

/** Et tall som huskes i localStorage, f.eks. antall kjøpte bonger */
export function useStoredNumber(key: string, initial = 0) {
  const [value, setValue] = useState(() => {
    try {
      const n = Number(localStorage.getItem(key))
      return Number.isFinite(n) && n > 0 ? n : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, String(value))
    } catch {
      // lagring utilgjengelig – verdien gjelder bare denne økta
    }
  }, [key, value])

  return [value, setValue] as const
}
