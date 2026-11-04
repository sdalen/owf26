import { useEffect, useState } from 'react'
import type { Floor, PitStopDay } from './types'

declare global {
  interface Window {
    goatcounter?: { count?: () => void }
  }
}

export type Route =
  | { view: 'home' }
  | { view: 'floors' }
  | { view: 'floor'; floor: Floor }
  /** whiskyId: scroll til og fremhev denne whiskyen */
  | { view: 'bar'; barId: string; whiskyId?: string }
  /** show: åpne «Min liste» med bare dette valget huket av */
  | { view: 'wishlist'; show?: ListShow }
  | { view: 'tastedList' }
  | { view: 'search' }
  | { view: 'pitstop'; day: PitStopDay }
  | { view: 'release' }

export type ListShow = 'must' | 'maybe' | 'tasted'

const showSlugs: Record<ListShow, string> = { must: 'ma-smake', maybe: 'kanskje', tasted: 'smakt' }

function parse(hash: string): Route {
  const [first, a, b] = hash.replace(/^#\/?/, '').split('/')
  switch (first) {
    case 'barer':
      if (a === '2' || a === '3' || a === '4') return { view: 'floor', floor: Number(a) as Floor }
      return { view: 'floors' }
    case 'bar':
      return a ? { view: 'bar', barId: a, whiskyId: b || undefined } : { view: 'floors' }
    case 'min-liste':
      return { view: 'wishlist', show: (Object.keys(showSlugs) as ListShow[]).find((k) => showSlugs[k] === a) }
    // Gamle egne sider – nå «Min liste» med forhåndsvalg
    case 'kanskje':
      return { view: 'wishlist', show: 'maybe' }
    case 'har-smakt':
      return { view: 'wishlist', show: 'tasted' }
    case 'smakt-liste':
      return { view: 'tastedList' }
    case 'sok':
      return { view: 'search' }
    case 'pit-stop':
      return { view: 'pitstop', day: a === 'lor' ? 'lør' : 'fre' }
    case 'spesialslipp':
      return { view: 'release' }
    default:
      return { view: 'home' }
  }
}

export function href(route: Route): string {
  switch (route.view) {
    case 'home':
      return '#/'
    case 'floors':
      return '#/barer'
    case 'floor':
      return `#/barer/${route.floor}`
    case 'bar':
      return `#/bar/${route.barId}${route.whiskyId ? `/${route.whiskyId}` : ''}`
    case 'wishlist':
      return `#/min-liste${route.show ? `/${showSlugs[route.show]}` : ''}`
    case 'tastedList':
      return '#/smakt-liste'
    case 'search':
      return '#/sok'
    case 'pitstop':
      return `#/pit-stop/${route.day === 'lør' ? 'lor' : 'fre'}`
    case 'release':
      return '#/spesialslipp'
  }
}

/** Enkel hash-ruting – gir fungerende tilbakeknapp på Android uten serveroppsett */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash))
      window.scrollTo(0, 0)
      // Første visning telles av GoatCounter selv; skjermbytter må telles her
      window.goatcounter?.count?.()
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
