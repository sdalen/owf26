import type { Notes, WhiskyNote } from './types'

const HASH_KEY = 'liste'

// Kompakt format per whisky: [id, flagg (1 = må smake, 2 = smakt, 4 = kanskje), rating (0 = ingen), whiskybase-url?, notat?]
type Entry = [string, number, number, string?, string?]

async function compress(text: string): Promise<Uint8Array> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function decompress(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Response(stream).text()
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

/** Lager en lenke til denne siden med lista innbakt i #-delen (sendes aldri til serveren) */
export async function createShareUrl(notes: Notes): Promise<string> {
  const entries: Entry[] = Object.entries(notes).map(([id, n]) => {
    const e: Entry = [id, (n.wantToTaste ? 1 : 0) | (n.tasted ? 2 : 0) | (n.maybe ? 4 : 0), n.rating ?? 0]
    if (n.whiskybaseUrl || n.tastingNote) e.push(n.whiskybaseUrl ?? '')
    if (n.tastingNote) e.push(n.tastingNote)
    return e
  })
  const payload = toBase64Url(await compress(JSON.stringify(entries)))
  const url = new URL(window.location.href)
  url.hash = `${HASH_KEY}=${payload}`
  return url.toString()
}

/** Leser en delt liste fra #-delen av adressen, om den finnes */
export async function readSharedNotes(hash: string): Promise<Notes | null> {
  const match = hash.match(new RegExp(`^#${HASH_KEY}=(.+)$`))
  if (!match) return null
  try {
    const entries = JSON.parse(await decompress(fromBase64Url(match[1]))) as Entry[]
    const notes: Notes = {}
    for (const [id, flags, rating, url, tastingNote] of entries) {
      const note: WhiskyNote = {}
      if (flags & 1) note.wantToTaste = true
      if (flags & 2) note.tasted = true
      if (flags & 4 && !(flags & 1)) note.maybe = true
      if (rating >= 1 && rating <= 5) note.rating = rating
      if (typeof url === 'string' && url.startsWith('https://')) note.whiskybaseUrl = url
      if (typeof tastingNote === 'string' && tastingNote) note.tastingNote = tastingNote.slice(0, 1000)
      notes[id] = note
    }
    return notes
  } catch {
    return null
  }
}

/** Slår sammen to lister – det delte vinner per felt der det har en verdi */
export function mergeNotes(mine: Notes, shared: Notes): Notes {
  const result: Notes = { ...mine }
  for (const [id, n] of Object.entries(shared)) {
    result[id] = {
      ...mine[id],
      ...(n.wantToTaste && { wantToTaste: true, maybe: false }),
      ...(n.maybe && !mine[id]?.wantToTaste && { maybe: true }),
      ...(n.tasted && { tasted: true }),
      ...(n.rating && { rating: n.rating }),
      ...(n.whiskybaseUrl && { whiskybaseUrl: n.whiskybaseUrl }),
      ...(n.tastingNote && !mine[id]?.tastingNote && { tastingNote: n.tastingNote }),
    }
  }
  return result
}

/** Deler via Android/iOS-delingsmenyen, ellers kopierer til utklippstavla */
export async function shareUrl(url: string): Promise<'shared' | 'copied' | 'cancelled'> {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Min whiskyliste – OWF 2026', url })
      return 'shared'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    }
  }
  await navigator.clipboard.writeText(url)
  return 'copied'
}
