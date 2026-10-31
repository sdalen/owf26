import type { Stats } from '../noteStatus'

/** Små tellere til høyre på etasje- og barknapper */
export function StatusCounts({ stats }: { stats: Stats }) {
  return (
    <div className="text-sm font-medium">
      {stats.must > 0 && (
        <p className="text-amber-400">
          {stats.mustDone}/{stats.must} må smake
        </p>
      )}
      {stats.maybe > 0 && (
        <p className="text-amber-200/70">
          {stats.maybeDone}/{stats.maybe} kanskje
        </p>
      )}
      {stats.tasted > 0 && <p className="text-emerald-400">{stats.tasted} smakt</p>}
    </div>
  )
}
