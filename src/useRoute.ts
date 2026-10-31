import { useEffect, useState } from 'react'
import type { Floor } from './types'

export type Route =
  | { view: 'home' }
  | { view: 'floors' }
  | { view: 'floor'; floor: Floor }
  | { view: 'bar'; barId: string }
  | { view: 'wishlist' }
  | { view: 'maybe' }
  | { view: 'tasted' }
  | { view: 'search' }

function parse(hash: string): Route {
  const [first, a] = hash.replace(/^#\/?/, '').split('/')
  switch (first) {
    case 'barer':
      if (a === '2' || a === '3' || a === '4') return { view: 'floor', floor: Number(a) as Floor }
      return { view: 'floors' }
    case 'bar':
      return a ? { view: 'bar', barId: a } : { view: 'floors' }
    case 'vil-smake':
      return { view: 'wishlist' }
    case 'kanskje':
      return { view: 'maybe' }
    case 'har-smakt':
      return { view: 'tasted' }
    case 'sok':
      return { view: 'search' }
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
      return `#/bar/${route.barId}`
    case 'wishlist':
      return '#/vil-smake'
    case 'maybe':
      return '#/kanskje'
    case 'tasted':
      return '#/har-smakt'
    case 'search':
      return '#/sok'
  }
}

/** Enkel hash-ruting – gir fungerende tilbakeknapp på Android uten serveroppsett */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
