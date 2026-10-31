import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  /** Hash-lenke til forrige nivå */
  back: string
  children?: ReactNode
}

export function TopBar({ title, subtitle, back, children }: Props) {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-white/5 bg-malt-950/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <a
          href={back}
          aria-label="Tilbake"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-malt-100 ring-1 ring-white/5 hover:bg-white/10"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
            <path d="M12.5 4.5 7 10l5.5 5.5" />
          </svg>
        </a>
        <div className="min-w-0">
          <h1 className="truncate font-display text-[22px] leading-tight font-semibold">{title}</h1>
          {subtitle && <p className="truncate text-xs text-malt-300">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
