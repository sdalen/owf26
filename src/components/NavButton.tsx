import type { ReactNode } from 'react'

interface Props {
  href: string
  title: string
  subtitle?: ReactNode
  /** Tall/teller til høyre */
  aside?: ReactNode
  accent?: 'amber' | 'emerald' | 'plain'
}

const accents = {
  amber: 'border-amber-400/50 bg-amber-400/10 hover:bg-amber-400/20',
  emerald: 'border-emerald-400/50 bg-emerald-400/10 hover:bg-emerald-400/20',
  plain: 'border-malt-900 bg-malt-900/50 hover:bg-malt-900',
}

export function NavButton({ href, title, subtitle, aside, accent = 'plain' }: Props) {
  return (
    <a href={href} className={`flex items-center gap-4 rounded-xl border px-4 py-4 transition-colors ${accents[accent]}`}>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold leading-tight text-malt-50">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm text-malt-300">{subtitle}</p>}
      </div>
      {aside && <div className="shrink-0 text-right">{aside}</div>}
      <span className="text-2xl text-malt-500">›</span>
    </a>
  )
}
