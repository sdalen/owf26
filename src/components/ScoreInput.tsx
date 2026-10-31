import { useState } from 'react'
import { formatScore, parseScore } from '../score'

interface Props {
  value?: number
  onChange: (value: number | undefined) => void
}

export function ScoreInput({ value, onChange }: Props) {
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? (value === undefined ? '' : formatScore(value))
  const valid = parseScore(text) !== null

  function commit() {
    if (draft === null) return
    const parsed = parseScore(draft)
    if (parsed !== null) onChange(parsed)
    setDraft(null)
  }

  return (
    <label className="flex items-center gap-1.5 text-xs font-medium text-malt-500">
      Score
      <input
        inputMode="decimal"
        enterKeyHint="done"
        placeholder="–"
        aria-label="Score fra 0 til 10"
        value={text}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') setDraft(null)
        }}
        className={`w-14 rounded-lg bg-malt-950 py-1 text-center font-display text-base font-semibold tabular-nums text-amber-300 ring-1 outline-none placeholder:text-malt-700 focus:ring-2 ${
          valid ? 'ring-malt-700 focus:ring-amber-400/60' : 'ring-red-500 focus:ring-red-500'
        }`}
      />
      <span>/10</span>
    </label>
  )
}
