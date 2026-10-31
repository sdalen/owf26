// «10 år» → «10», ellers treffer ikke søket på Whiskybase
export function whiskybaseSearchUrl(name: string): string {
  return `https://www.whiskybase.com/search?q=${encodeURIComponent(name.replace(/(\d+)\s*års?\b/gi, '$1'))}`
}
