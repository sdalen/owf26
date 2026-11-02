import type { ReactNode } from 'react'
import type { StatusFilter } from '../statusFilter'

/** Avhukingsknapper for vil smake, kanskje og smakt – brukes på «Min liste» og barsidene */
export function StatusFilterBar({ filter, onToggle, className = '' }: { filter: StatusFilter; onToggle: (key: keyof StatusFilter) => void; className?: string }) {
  return (
    <div className={`flex gap-1.5 ${className}`}>
      <FilterToggle on={filter.must} onClick={() => onToggle('must')} onClass="bg-amber-400 text-malt-950">
        Vil smake
      </FilterToggle>
      <FilterToggle on={filter.maybe} onClick={() => onToggle('maybe')} onClass="bg-amber-200 text-malt-950">
        Kanskje
      </FilterToggle>
      <FilterToggle on={filter.tasted} onClick={() => onToggle('tasted')} onClass="bg-emerald-400 text-malt-950">
        Smakt
      </FilterToggle>
    </div>
  )
}

function FilterToggle({ on, onClick, onClass, children }: { on: boolean; onClick: () => void; onClass: string; children: ReactNode }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition active:scale-95 ${
        on ? `${onClass} ring-transparent` : 'text-malt-300 ring-malt-700 hover:text-malt-50'
      }`}
    >
      <span aria-hidden>{on ? '☑' : '☐'}</span>
      {children}
    </button>
  )
}
