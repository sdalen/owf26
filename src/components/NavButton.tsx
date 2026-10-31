import type { ReactNode } from 'react'

interface Props {
  href: string
  title: string
  subtitle?: ReactNode
  /** Tall/teller til høyre */
  aside?: ReactNode
  /** Lite symbol i en farget sirkel til venstre */
  icon?: ReactNode
  accent?: 'amber' | 'emerald' | 'plain'
}

const iconColors = {
  amber: 'bg-amber-400/15 text-amber-300',
  emerald: 'bg-emerald-400/15 text-emerald-300',
  plain: 'bg-white/5 text-malt-100',
}

export function NavButton({ href, title, subtitle, aside, icon, accent = 'plain' }: Props) {
  return (
    <a href={href} className="card flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-malt-800 active:scale-[0.99]">
      {icon && <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-lg ${iconColors[accent]}`}>{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="leading-tight font-semibold text-malt-50">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm text-malt-300">{subtitle}</p>}
      </div>
      {aside && <div className="shrink-0 text-right">{aside}</div>}
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-malt-500" aria-hidden>
        <path d="M7.5 4.5 13 10l-5.5 5.5" />
      </svg>
    </a>
  )
}
