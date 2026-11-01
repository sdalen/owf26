import { BONG_PRICE, formatKr, TICKET_PRICE } from '../data/prices'

interface Props {
  ticketDays: number
  extra: number
}

/** Hva festivalen koster deg: billett + ekstra bonger */
export function CostCard({ ticketDays, extra }: Props) {
  const ticket = TICKET_PRICE[ticketDays] ?? 0
  const bonger = extra * BONG_PRICE
  if (ticket + bonger === 0) return null

  return (
    <section className="card flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-malt-50">Totalkostnad</h2>
        <p className="text-xs text-malt-300">
          {[ticket > 0 && `${ticketDays === 1 ? '1-dags' : '2-dags'}billett ${formatKr(ticket)}`, extra > 0 && `${extra} × ${BONG_PRICE} kr bonger`]
            .filter(Boolean)
            .join(' + ')}
        </p>
      </div>
      <p className="shrink-0 font-display text-2xl font-semibold tabular-nums text-amber-200">{formatKr(ticket + bonger)}</p>
    </section>
  )
}
