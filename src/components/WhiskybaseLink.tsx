import { useState } from 'react'

interface Props {
  name: string
  url?: string
  onChange: (url: string | undefined) => void
}

function isWhiskybaseUrl(value: string) {
  try {
    return new URL(value).hostname.endsWith('whiskybase.com')
  } catch {
    return false
  }
}

export function WhiskybaseLink({ name, url, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(url ?? '')
  const valid = draft === '' || isWhiskybaseUrl(draft)

  if (editing) {
    return (
      <form
        className="flex w-full flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          onChange(draft.trim() || undefined)
          setEditing(false)
        }}
      >
        <input
          autoFocus
          type="url"
          inputMode="url"
          placeholder="https://www.whiskybase.com/whiskies/whisky/…"
          value={draft}
          onChange={(e) => setDraft(e.target.value.trim())}
          className={`min-w-0 flex-1 rounded-md border bg-malt-950 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-malt-500 ${
            valid ? 'border-malt-700' : 'border-red-500'
          }`}
        />
        <button type="submit" disabled={!valid} className="rounded-md bg-malt-500 px-2 py-1 text-sm font-medium text-malt-950 disabled:opacity-40">
          Lagre
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(url ?? '')
            setEditing(false)
          }}
          className="px-1 text-sm text-malt-300 hover:text-malt-50"
        >
          Avbryt
        </button>
        <a
          href={`https://www.whiskybase.com/search?q=${encodeURIComponent(name)}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-malt-300 underline underline-offset-2 hover:text-malt-50"
        >
          Søk på Whiskybase ↗
        </a>
      </form>
    )
  }

  return url ? (
    <span className="inline-flex items-center gap-1 text-sm">
      <a href={url} target="_blank" rel="noreferrer" className="rounded bg-sky-900/60 px-1.5 py-0.5 font-medium text-sky-200 hover:bg-sky-800">
        WB ↗
      </a>
      <button type="button" onClick={() => setEditing(true)} className="text-malt-500 hover:text-malt-100" title="Endre Whiskybase-lenke">
        ✎
      </button>
    </span>
  ) : (
    <button
      type="button"
      onClick={() => {
        setDraft('')
        setEditing(true)
      }}
      className="text-sm text-malt-500 hover:text-malt-100"
    >
      + WB-lenke
    </button>
  )
}
