// ?tid=2026-11-06T18:28 starter klokka på det tidspunktet og lar den gå videre – for å teste pit-stop
const clockOffset = (() => {
  const override = new URLSearchParams(window.location.search).get('tid')
  const t = override ? new Date(`${override}+01:00`).getTime() : NaN
  return Number.isNaN(t) ? 0 : t - Date.now()
})()

export function now(): Date {
  return new Date(Date.now() + clockOffset)
}
