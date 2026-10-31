interface Props {
  value?: number
  onChange: (value: number | undefined) => void
}

export function StarRating({ value = 0, onChange }: Props) {
  return (
    <div className="-ml-[3px] flex" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} av 5`}
          title={value === n ? 'Fjern rating' : `${n} av 5`}
          // Trykk på samme stjerne igjen for å nullstille
          onClick={() => onChange(value === n ? undefined : n)}
          className={`px-[3px] text-xl leading-none transition-colors ${
            n <= value ? 'text-amber-400' : 'text-malt-700 hover:text-malt-500'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
