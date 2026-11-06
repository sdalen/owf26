// Generert fra Vinmonopolets lanseringsliste (202611-brennevin-lanseringsliste-vinmonopolet.xlsx)

/** Polene som får spesialslippet. 801 er nettbutikken. */
export const releaseStores = [
  { id: 114, name: 'Oslo, Aker Brygge' },
  { id: 150, name: 'Bergen, Valkendorfsgate' },
  { id: 230, name: 'Hamar' },
  { id: 116, name: 'Sandnes Kvadrat' },
  { id: 161, name: 'Oslo, Storo' },
  { id: 283, name: 'Sandefjord' },
  { id: 180, name: 'Trondheim, Valentinlyst' },
  { id: 282, name: 'Tromsø, Langnes' },
  { id: 801, name: 'Nettbutikken' },
] as const

export const ONLINE_STORE = 801

export interface Allocation {
  /** Flasker totalt i slippet */
  total: number
  /** Polnummer → antall flasker. Pol som ikke får varen er utelatt. */
  stores: Record<number, number>
  /** F.eks. «Maks 1 pr kunde» */
  quota?: string
}

/** Varenummer → fordeling per pol */
export const allocations: Record<string, Allocation> = {
  '20890301': { total: 89, stores: { 114: 11, 150: 12, 230: 6, 116: 12, 161: 12, 283: 12, 180: 12, 282: 12 } }, // Old Fitzgerald Bottled-In-Bond 7 YO
  '19237801': { total: 95, stores: { 114: 13, 150: 14, 230: 6, 116: 12, 161: 12, 283: 12, 180: 12, 282: 14 } }, // Heaven Hill Bottled-in-Bond Kentucky 7YO Straight Bourbon Whiskey
  '21225201': { total: 11, stores: { 114: 1, 150: 2, 116: 2, 161: 2, 283: 1, 180: 1, 282: 2 } }, // Adelphi Blair Athol 2013
  '21225501': { total: 11, stores: { 114: 1, 150: 2, 116: 2, 161: 2, 283: 1, 180: 1, 282: 2 } }, // Adelphi Glasgow 2016
  '21225101': { total: 11, stores: { 114: 1, 150: 2, 116: 2, 161: 2, 283: 1, 180: 1, 282: 2 } }, // Adelphi Glenlossie 2011
  '21225401': { total: 23, stores: { 114: 3, 150: 3, 230: 2, 116: 3, 161: 3, 283: 3, 180: 3, 282: 3 } }, // Adelphi Benrinnes 2012
  '21225001': { total: 11, stores: { 114: 1, 150: 1, 116: 2, 161: 2, 283: 2, 180: 1, 282: 2 } }, // Adelphi Dailuaine 2010
  '21225301': { total: 5, stores: { 114: 1, 150: 2, 116: 2 } }, // Adelphi Glen Elgin 2009
  '21225701': { total: 119, stores: { 114: 15, 150: 16, 230: 6, 116: 16, 161: 18, 283: 16, 180: 16, 282: 16 } }, // Ardnamurchan AD Midgie
  '21225601': { total: 179, stores: { 114: 23, 150: 20, 230: 6, 116: 22, 161: 24, 283: 20, 180: 20, 282: 20, 801: 24 } }, // Ardnamurchan Tokaji
  '20899101': { total: 147, stores: { 114: 23, 150: 20, 230: 4, 116: 20, 161: 20, 283: 20, 180: 20, 282: 20 } }, // Arran Signature Series Edition 4
  '21229901': { total: 59, stores: { 114: 7, 150: 8, 230: 6, 116: 8, 161: 8, 283: 6, 180: 8, 282: 8 } }, // Bruichladdich Greener Still
  '21237001': { total: 89, stores: { 114: 11, 150: 12, 230: 6, 116: 12, 161: 12, 283: 12, 180: 12, 282: 12 } }, // GlenAllachie 10YO Batch 13 Single Malt Whisky
  '21165101': { total: 59, stores: { 114: 5, 150: 6, 230: 6, 116: 6, 161: 6, 283: 6, 180: 6, 282: 6, 801: 12 }, quota: 'Maks 1 pr kunde' }, // Kilkerran 16 YO
  '21237101': { total: 47, stores: { 114: 5, 150: 6, 230: 6, 116: 6, 161: 6, 283: 6, 180: 6, 282: 6 } }, // Kilchoman Maury Cask Single Malt Whisky
  '21171801': { total: 101, stores: { 114: 19, 150: 12, 230: 6, 116: 14, 161: 14, 283: 12, 180: 12, 282: 12 } }, // Aberargie Expressions Golden Promise
  '21165001': { total: 59, stores: { 114: 9, 150: 6, 230: 6, 116: 8, 161: 6, 283: 6, 180: 6, 282: 6, 801: 6 }, quota: 'Maks 1 pr kunde' }, // Springbank 10 YO Fino
  '21221501': { total: 23, stores: { 114: 4, 150: 3, 230: 2, 116: 3, 161: 3, 283: 2, 180: 3, 282: 3 }, quota: 'Maks 1 pr kunde' }, // Springbank 21YO
  '21165201': { total: 18, stores: { 114: 4, 150: 2, 116: 3, 161: 2, 283: 2, 180: 2, 282: 3 }, quota: 'Maks 1 pr kunde' }, // Springbank 30 YO
  '21164901': { total: 41, stores: { 114: 7, 150: 6, 230: 4, 116: 6, 283: 6, 180: 6, 282: 6 }, quota: 'Maks 1 pr kunde' }, // Springbank Local Barley
  '21226601': { total: 149, stores: { 114: 21, 150: 20, 230: 6, 116: 22, 161: 20, 283: 20, 180: 20, 282: 20 } }, // Braeval Single Malt Single Cask 15YO Port Finish The Cooper's Choice
  '21226801': { total: 77, stores: { 114: 11, 150: 10, 230: 6, 116: 10, 161: 10, 283: 10, 180: 10, 282: 10 } }, // Glen Spey Speyside Singe Malt Single Cask 13YO Sauternes Finish The Cooper's Choice
  '21226701': { total: 46, stores: { 114: 5, 150: 6, 230: 5, 116: 6, 161: 6, 283: 6, 180: 6, 282: 6 } }, // Caol Ila Islay Single Malt 10YO Bourbon Cask The Golden Cut Collection
  '21226901': { total: 89, stores: { 114: 11, 150: 12, 230: 6, 116: 12, 161: 12, 283: 12, 180: 12, 282: 12 } }, // Balmenach Speyside Single Malt 11YO Madeira Finish The Golden Cut Collection
  '21233001': { total: 95, stores: { 114: 13, 150: 12, 230: 6, 116: 14, 161: 12, 283: 12, 180: 12, 282: 14 } }, // Edradour 2012 Ibisco Bourbon 14YO Cask Strength 1 Fill Bourbon Barrels
  '21171701': { total: 184, stores: { 114: 21, 150: 22, 230: 12, 116: 22, 161: 20, 283: 20, 180: 20, 282: 20, 801: 27 } }, // Loch Lomond Single Cask 2012 Cask No. 2531 Tropical Storm
  '21232901': { total: 95, stores: { 114: 13, 150: 12, 230: 6, 116: 14, 161: 12, 283: 12, 180: 12, 282: 14 } }, // Signatory Craigellachie 2009 CS 17YO 1 Fill Madeira Hogshead Cask Strength Col
  '21232801': { total: 95, stores: { 114: 13, 150: 12, 230: 6, 116: 14, 161: 12, 283: 12, 180: 12, 282: 14 } }, // Knockdhu 2008 Signatory CS 17YO 2 Fill Oloroso Sherry Butt Cask Strength Colle
  '21227501': { total: 119, stores: { 114: 11, 150: 12, 230: 6, 116: 12, 161: 12, 283: 12, 180: 12, 282: 12, 801: 30 } }, // The Macallan Sherry Oak 12 YO 110 Proof
  '19213201': { total: 179, stores: { 114: 23, 150: 24, 230: 6, 116: 24, 161: 24, 283: 12, 180: 24, 282: 24, 801: 18 } }, // Blue Spot 7 YO Cask Strength Single Pot Still Irish Whiskey
  '21227101': { total: 59, stores: { 114: 7, 150: 8, 230: 6, 116: 8, 161: 8, 283: 8, 180: 8, 282: 6 } }, // Kanosuke Double Distillery Whisky
}
