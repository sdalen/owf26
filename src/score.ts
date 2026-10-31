/** Score 0–10 med én desimal. Tom tekst → undefined (ingen score), ugyldig → null */
export function parseScore(input: string): number | undefined | null {
  const value = input.trim().replace(',', '.')
  if (value === '') return undefined
  if (!/^\d{1,2}(\.\d?)?$/.test(value)) return null
  const n = Math.round(Number(value) * 10) / 10
  return n >= 0 && n <= 10 ? n : null
}

export function formatScore(score: number): string {
  return score.toLocaleString('nb-NO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}
