import type { Stats } from '../noteStatus'

/** Små tellere til høyre på etasje- og barknapper */
export function StatusCounts({ stats, row = false }: { stats: Stats; row?: boolean }) {
  return (
    <div className={`flex gap-1 text-xs font-semibold tabular-nums ${row ? 'flex-wrap justify-end' : 'flex-col items-end'}`}>
      {stats.must > 0 && (
        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-amber-300">
          ♥ {stats.mustDone}/{stats.must}
        </span>
      )}
      {stats.maybe > 0 && (
        <span className="rounded-full bg-amber-200/10 px-2 py-0.5 text-amber-200/80">
          ? {stats.maybeDone}/{stats.maybe}
        </span>
      )}
      {stats.tasted > 0 && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-emerald-300">✓ {stats.tasted}</span>}
    </div>
  )
}
