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
    <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-malt-900 bg-malt-950/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <a href={back} aria-label="Tilbake" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-malt-900 text-xl text-malt-100 hover:bg-malt-700">
          ‹
        </a>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-malt-300">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
