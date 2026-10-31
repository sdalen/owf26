import { useEffect, useState } from 'react'
import { PitStopStrip } from './components/PitStopBanner'
import { SharedListBanner } from './components/SharedListBanner'
import { createShareUrl, mergeNotes, readSharedNotes, shareUrl } from './share'
import type { Notes } from './types'
import { useNotes } from './useNotes'
import { useRoute } from './useRoute'
import { BarView } from './views/BarView'
import { FloorsView } from './views/FloorsView'
import { FloorView } from './views/FloorView'
import { HomeView } from './views/HomeView'
import { ListView } from './views/ListView'
import { PitStopView } from './views/PitStopView'
import { SearchView } from './views/SearchView'
import { TastedListView } from './views/TastedListView'

export default function App() {
  const { notes, update, replaceAll } = useNotes()
  const route = useRoute()
  const [sharedNotes, setSharedNotes] = useState<Notes | null>(null)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  useEffect(() => {
    const check = () => void readSharedNotes(window.location.hash).then((shared) => shared && setSharedNotes(shared))
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [])

  function closeSharedList() {
    setSharedNotes(null)
    window.location.replace('#/')
  }

  async function shareList() {
    try {
      const result = await shareUrl(await createShareUrl(notes))
      if (result === 'copied') setShareStatus('Lenke kopiert – lim den inn i SMS eller chat')
    } catch {
      setShareStatus('Klarte ikke å dele lenken')
    }
    setTimeout(() => setShareStatus(null), 4000)
  }

  function exportNotes() {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'owf26-notater.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importNotes(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as Notes
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('Ugyldig format')
      if (confirm('Erstatte dine nåværende markeringer med innholdet i filen?')) replaceAll(parsed)
    } catch {
      alert('Klarte ikke å lese filen.')
    }
  }

  let content
  switch (route.view) {
    case 'floors':
      content = <FloorsView notes={notes} />
      break
    case 'floor':
      content = <FloorView floor={route.floor} notes={notes} />
      break
    case 'bar':
      content = <BarView barId={route.barId} notes={notes} onUpdate={update} />
      break
    case 'wishlist':
    case 'maybe':
    case 'tasted':
      content = <ListView mode={route.view} notes={notes} onUpdate={update} />
      break
    case 'search':
      content = <SearchView notes={notes} onUpdate={update} />
      break
    case 'tastedList':
      content = <TastedListView notes={notes} />
      break
    case 'pitstop':
      content = <PitStopView day={route.day} notes={notes} onUpdate={update} />
      break
    default:
      content = (
        <>
          {sharedNotes && (
            <div className="pt-6">
              <SharedListBanner
                shared={sharedNotes}
                onMerge={() => {
                  replaceAll((prev) => mergeNotes(prev, sharedNotes))
                  closeSharedList()
                }}
                onReplace={() => {
                  if (!confirm('Erstatte hele din liste med den delte?')) return
                  replaceAll(sharedNotes)
                  closeSharedList()
                }}
                onDismiss={closeSharedList}
              />
            </div>
          )}
          <HomeView notes={notes} onShare={() => void shareList()} shareStatus={shareStatus} onExport={exportNotes} onImport={(f) => void importNotes(f)} />
        </>
      )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24">
      {/* Forsiden har det store varselet; de andre skjermene får en stripe */}
      {route.view !== 'home' && <PitStopStrip notes={notes} />}
      {content}
    </div>
  )
}
