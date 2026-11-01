import { useRef } from 'react'

/** Liten i-knapp med informasjon om appen */
export function InfoButton() {
  const dialog = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label="Om appen"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/5 font-display text-lg font-semibold text-malt-300 italic ring-1 ring-white/5 hover:bg-white/10 hover:text-malt-50"
      >
        i
      </button>

      <dialog
        ref={dialog}
        // Lukk ved trykk utenfor boksen
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-2xl bg-malt-900 p-0 text-malt-100 ring-1 ring-white/10 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="p-5">
          <h2 className="font-display text-xl font-semibold text-malt-50">Om appen</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed">
            <p>Dette er et hobbyprosjekt og ikke en offisiell app fra Oslo Whiskyfestival.</p>
            <p>
              Barer, whisky, bongpriser og pit-stop-drammer er hentet fra festivalhåndboka (PDF) for 2026. Det kan forekomme feil og mangler, så sjekk med baren
              hvis noe ikke stemmer.
            </p>
            <p>
              Det du markerer, scorer og noterer, lagres bare i nettleseren på denne enheten. Sletter du nettleserdata eller fjerner appen, forsvinner det. Bruk
              «Del lista mi» eller «Eksporter» nederst på forsiden for å ta vare på det eller flytte det til en annen enhet.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-2.5 font-semibold text-malt-950 hover:bg-amber-300"
          >
            Skjønner
          </button>
        </div>
      </dialog>
    </>
  )
}
