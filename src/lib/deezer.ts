/**
 * Deezer Public API Client
 * Free, no authentication required for public data.
 * See: https://developers.deezer.com/api
 */

// Proxy through Next.js API route to avoid CORS issues
const API = "/api/deezer"

// ─── Raw fetch ───────────────────────────────────────────

import { logApiError } from "./api-logger"
import { cacheApiData, getFallbackData } from "./data-cache"
import { enqueueRetry } from "./offline-queue"

/** Retry delay with exponential backoff (ms) */
function retryDelay(attempt: number): number {
  return Math.min(100 * Math.pow(2, attempt), 2000)
}

/** Map HTTP status to a user-friendly error message */
function friendlyHttpError(status: number): string {
  if (status === 404) return "Content not found. It may have been removed or the link may be incorrect."
  if (status === 429) return "Too many requests. Please wait a moment and try again."
  if (status === 403) return "Access denied. This content may not be available in your region."
  if (status === 502 || status === 503) return "The music service is temporarily unavailable. Please try again later."
  if (status >= 500) return "The music service encountered a server error. Please try again later."
  return `Unexpected error (${status}). Please try again.`
}

async function fetchDeezer<T>(path: string, retries = 2): Promise<T> {
  const url = `${API}${path}`

  // ── Offline fast-path: serve cache immediately, skip network ──
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const cached = getFallbackData<T>(path)
    if (cached !== null) {
      console.warn(`[Deezer] 📦 Offline — serving cache for GET ${url}`)
      enqueueRetry(path)
      return cached
    }
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const start = performance.now()

    // ── Phase 1: The actual fetch (network layer only) ──
    // fetch() ONLY throws on network failure or abort. HTTP 4xx/5xx NEVER throw.
    // So ANY error we catch here is DEFINITELY a network/abort issue — retry it.
    let res: Response
    try {
      res = await fetch(url, {
        signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
          ? AbortSignal.timeout(15000)
          : undefined,
      })
    } catch (fetchErr: unknown) {
      // fetch() threw → this is ALWAYS a network error or abort
      const fetchErrObj = fetchErr && typeof fetchErr === "object"
        ? (fetchErr as { name?: string; message?: string })
        : null
      const fetchErrName = fetchErrObj?.name || String(fetchErr)
      const fetchErrMsg = fetchErrObj?.message || String(fetchErr)

      // Abort → component unmount or manual cancel, don't retry
      if (fetchErrName.includes("Abort")) throw fetchErr

      // Network error → retry
      console.warn(`[Deezer] ⚠ Network: GET ${url} (attempt ${attempt + 1}/${retries + 1}): ${fetchErrMsg}`)

      if (attempt < retries) {
        const delay = retryDelay(attempt)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }

      logApiError(path, fetchErr, attempt)
      console.error(`[Deezer] 💥 Network: GET ${url} failed after ${retries + 1} attempts`)

      const cached = getFallbackData<T>(path)
      if (cached !== null) {
        console.warn(`[Deezer] 📦 Serving stale cache for GET ${url}`)
        enqueueRetry(path)
        return cached
      }

      throw new Error("Could not load data. Please check your internet connection and try again.")
    }

    // ── Phase 2: Response handling (HTTP errors, JSON parsing) ──
    // If we're here, the network request succeeded (we got a Response object)
    const duration = Math.round(performance.now() - start)
    console.debug(`[Deezer] ➡ GET ${url} → ${res.status} (${duration}ms)`)

    // Handle HTTP errors
    if (!res.ok) {
      const text = await res.text()
      console.error(`[Deezer] ❌ GET ${url} → ${res.status}: ${text.slice(0, 200)}`)
      logApiError(path, new Error(friendlyHttpError(res.status)), attempt, res.status)

      // 5xx (server errors) → retry or cache
      if (res.status >= 500) {
        if (attempt < retries) {
          const delay = retryDelay(attempt)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
        const cached = getFallbackData<T>(path)
        if (cached !== null) {
          console.warn(`[Deezer] 📦 Serving stale cache for GET ${url} after server error`)
          return cached
        }
      }

      // 4xx (client errors: 404, 403, 429) → never retry, show message
      throw new Error(friendlyHttpError(res.status))
    }

    // Parse JSON
    let json: T
    try {
      json = await res.json()
    } catch {
      const cached = getFallbackData<T>(path)
      if (cached !== null) {
        console.warn(`[Deezer] 📦 Serving stale cache for GET ${url} after parse error`)
        return cached
      }
      throw new Error("Invalid response from server")
    }

    // Success!
    cacheApiData(path, json)
    return json
  }

  throw new Error("Could not load data")
}

// ─── Deezer raw types ────────────────────────────────────

interface DeezerArtist {
  id: number
  name: string
  picture: string
  picture_small: string
  picture_medium: string
  picture_big: string
  picture_xl: string
  nb_album?: number
  nb_fan?: number
  type: "artist"
}

interface DeezerAlbum {
  id: number
  title: string
  cover: string
  cover_small: string
  cover_medium: string
  cover_big: string
  cover_xl: string
  release_date: string
  artist: DeezerArtist
  tracks?: { data: DeezerTrack[] }
  nb_tracks?: number
  label?: string
  type: "album"
}

interface DeezerTrack {
  id: number
  title: string
  duration: number // seconds
  preview: string // 30s MP3 URL
  artist: DeezerArtist
  album: DeezerAlbum
  explicit_lyrics: boolean
  track_position: number
  type: "track"
}

interface DeezerPlaylist {
  id: number
  title: string
  description: string
  picture: string
  picture_small: string
  picture_medium: string
  picture_big: string
  picture_xl: string
  creator: { id: number; name: string }
  tracks: { data: DeezerTrack[] }
  nb_tracks: number
  fans: number
  type: "playlist"
}

// ─── Transform helpers ───────────────────────────────────

function toImage(url: string) {
  return { url, height: null, width: null }
}

/** Convert Deezer search results to match our internal SpotifySearchResult shape */
function transformSearchResults(
  tracks: DeezerTrack[],
  albums: DeezerAlbum[],
  artists: DeezerArtist[],
  playlists: DeezerPlaylist[]
) {
  return {
    tracks: { items: tracks.map(transformTrack), total: tracks.length, limit: 0, offset: 0, href: "", next: null, previous: null },
    albums: { items: albums.map(transformAlbum), total: albums.length, limit: 0, offset: 0, href: "", next: null, previous: null },
    artists: { items: artists.map(transformArtist), total: artists.length, limit: 0, offset: 0, href: "", next: null, previous: null },
    playlists: { items: playlists.map(transformPlaylist), total: playlists.length, limit: 0, offset: 0, href: "", next: null, previous: null },
  }
}

function transformTrack(t: DeezerTrack): any {
  if (!t.artist) console.debug(`[Deezer] ⚠ Track ${t.id} missing artist, using fallback`)
  if (!t.album) console.debug(`[Deezer] ⚠ Track ${t.id} missing album, using fallback`)

  const artist = t.artist || {} as any
  return {
    id: String(t.id),
    name: t.title || "Unknown Track",
    artists: [{ id: String(artist.id ?? ""), name: artist.name || "Unknown Artist", type: "artist" as const, uri: "", images: [toImage(artist.picture_medium || "")], genres: [], followers: { href: null, total: 0 }, popularity: 0, external_urls: { spotify: "" } }],
    album: t.album ? transformAlbum(t.album) : {
      id: "", name: "Unknown Album", type: "album" as const, album_type: "album" as const,
      artists: [], images: [], release_date: "", total_tracks: 0, uri: "", external_urls: { spotify: "" },
    },
    duration_ms: (t.duration || 0) * 1000,
    explicit: t.explicit_lyrics || false,
    popularity: 0,
    preview_url: t.preview || null,
    uri: `deezer:track:${t.id}`,
    track_number: t.track_position || 0,
    disc_number: 1,
    external_urls: { spotify: "" },
  }
}

function transformAlbum(a: DeezerAlbum): any {
  if (!a.artist) console.debug(`[Deezer] ⚠ Album ${a.id} missing artist, using fallback`)

  const artist = a.artist || {} as any
  return {
    id: String(a.id),
    name: a.title || "Unknown Album",
    type: "album" as const,
    album_type: "album" as const,
    artists: [{ id: String(artist.id ?? ""), name: artist.name || "Unknown Artist", type: "artist" as const, uri: "", images: [toImage(artist.picture_medium || "")], genres: [], followers: { href: null, total: 0 }, popularity: 0, external_urls: { spotify: "" } }],
    images: [
      toImage(a.cover_xl || a.cover_big || a.cover_medium || a.cover || ""),
      toImage(a.cover_big || a.cover_medium || a.cover || ""),
      toImage(a.cover_medium || a.cover || ""),
    ],
    release_date: a.release_date || "",
    total_tracks: a.nb_tracks || (a.tracks?.data?.length || 0),
    uri: `deezer:album:${a.id}`,
    external_urls: { spotify: "" },
    label: a.label,
    tracks: a.tracks ? { items: a.tracks.data.map(transformTrack), total: a.tracks.data.length, limit: 0, offset: 0, href: "", next: null, previous: null } : undefined,
  }
}

function transformArtist(a: DeezerArtist) {
  return {
    id: String(a.id),
    name: a.name,
    type: "artist" as const,
    uri: `deezer:artist:${a.id}`,
    images: [toImage(a.picture_xl || a.picture_big || a.picture_medium), toImage(a.picture_big || a.picture_medium), toImage(a.picture_medium)],
    genres: [],
    followers: { href: null, total: a.nb_fan || 0 },
    popularity: 0,
    external_urls: { spotify: "" },
  }
}

function transformPlaylist(p: DeezerPlaylist) {
  return {
    id: String(p.id),
    name: p.title || "Unknown Playlist",
    description: p.description || "",
    images: [toImage(p.picture_xl || p.picture_big || p.picture_medium), toImage(p.picture_big || p.picture_medium), toImage(p.picture_medium)],
    owner: { id: String(p.creator?.id || ""), display_name: p.creator?.name || "Deezer" },
    public: true,
    collaborative: false,
    tracks: {
      items: (p.tracks?.data || []).map((t) => ({ added_at: "", track: transformTrack(t) })),
      total: p.nb_tracks || 0,
      limit: 0, offset: 0, href: "", next: null, previous: null,
    },
    uri: `deezer:playlist:${p.id}`,
    external_urls: { spotify: "" },
    followers: { href: null, total: p.fans || 0 },
  }
}

// ─── High-level API functions ────────────────────────────

/** Search across all types (track, album, artist, playlist) */
export async function searchAll(query: string) {
  console.debug(`[Deezer] 🔍 searchAll("${query}")`)
  const [tracks, albums, artists, playlists] = await Promise.all([
    fetchDeezer<{ data: DeezerTrack[] }>(`/search/track?q=${encodeURIComponent(query)}&limit=8`),
    fetchDeezer<{ data: DeezerAlbum[] }>(`/search/album?q=${encodeURIComponent(query)}&limit=5`),
    fetchDeezer<{ data: DeezerArtist[] }>(`/search/artist?q=${encodeURIComponent(query)}&limit=5`),
    fetchDeezer<{ data: DeezerPlaylist[] }>(`/search/playlist?q=${encodeURIComponent(query)}&limit=5`),
  ])
  return transformSearchResults(
    tracks.data || [],
    albums.data || [],
    artists.data || [],
    playlists.data || [],
  )
}

/** Search by type (track, album, artist, playlist) */
export async function searchByType(query: string, type: string, limit = 8) {
  console.debug(`[Deezer] 🔍 searchByType("${query}", "${type}")`)
  const result = await fetchDeezer<{ data: DeezerTrack[] }>(`/search/${type}?q=${encodeURIComponent(query)}&limit=${limit}`)
  return result.data || []
}

/** Get a single album with tracks */
export async function getAlbum(id: string) {
  console.debug(`[Deezer] 💿 getAlbum(${id})`)
  const data = await fetchDeezer<DeezerAlbum>(`/album/${id}`)
  return transformAlbum(data)
}

/** Get a single track by ID */
export async function getTrack(id: string) {
  console.debug(`[Deezer] 🎵 getTrack(${id})`)
  const data = await fetchDeezer<DeezerTrack>(`/track/${id}`)
  return transformTrack(data)
}

/** Get a single artist */
export async function getArtist(id: string) {
  console.debug(`[Deezer] 🎤 getArtist(${id})`)
  const [artistData, topTracksData, albumsData]: [any, any, any] = await Promise.all([
    fetchDeezer(`/artist/${id}`),
    fetchDeezer(`/artist/${id}/top?limit=10`),
    fetchDeezer(`/artist/${id}/albums?limit=50`),
  ])

  const rawAlbums: any[] = albumsData.data || []

  // Sort albums by release_date descending (newest first)
  const sortedAlbums = rawAlbums
    .map(transformAlbum)
    .sort((a: any, b: any) => {
      const dateA = a.release_date ? new Date(a.release_date).getTime() : 0
      const dateB = b.release_date ? new Date(b.release_date).getTime() : 0
      return dateB - dateA
    })

  return {
    artist: transformArtist(artistData),
    topTracks: (topTracksData.data || []).map(transformTrack),
    albums: sortedAlbums,
    nbAlbum: artistData.nb_album || rawAlbums.length,
  }
}

/** Get related artists (not available on Deezer public API, return empty) */
export async function getRelatedArtists(_id: string) {
  return { artists: [] }
}

/** Get a single playlist with tracks */
export async function getPlaylist(id: string) {
  console.debug(`[Deezer] 📋 getPlaylist(${id})`)
  const data = await fetchDeezer<DeezerPlaylist>(`/playlist/${id}`)
  return transformPlaylist(data)
}

/** Get chart/featured content (replaces Spotify's featured playlists + new releases) */
export async function getChart() {
  console.debug(`[Deezer] 📊 getChart()`)
  const data: any = await fetchDeezer("/chart")
  return {
    playlists: (data.playlists?.data || []).map(transformPlaylist),
    albums: (data.albums?.data || []).map(transformAlbum),
    tracks: (data.tracks?.data || []).map(transformTrack),
    artists: (data.artists?.data || []).map(transformArtist),
  }
}

/** Search tracks (for SearchClient) */
export async function searchTracks(query: string, limit = 8) {
  console.debug(`[Deezer] 🔍 searchTracks("${query}")`)
  const result = await fetchDeezer<{ data: DeezerTrack[] }>(`/search/track?q=${encodeURIComponent(query)}&limit=${limit}`)
  return (result.data || []).map(transformTrack)
}

/** Get all music genres */
export async function getGenres() {
  console.debug(`[Deezer] 🏷️ getGenres()`)
  const data = await fetchDeezer<{ data: { id: number; name: string; picture: string }[] }>("/genre")
  return (data.data || []).filter((g) => g.id !== 0) // Remove "All" genre
}

/** Search by genre ID (returns top tracks for a genre) */
export async function searchByGenre(genreId: number, limit = 8) {
  console.debug(`[Deezer] 🏷️ searchByGenre(${genreId})`)
  // Deezer doesn't have a direct genre search, use the genre's artist endpoint or radio
  const data = await fetchDeezer<{ data: DeezerTrack[] }>(`/radio/genre/${genreId}/tracks?limit=${limit}`)
  return (data.data || []).map(transformTrack)
}

/** Get full genre radio station data: genre info + tracks */
export async function getGenreRadio(genreId: number, limit = 20) {
  console.debug(`[Deezer] 📻 getGenreRadio(${genreId})`)
  const [genres, tracksData] = await Promise.all([
    getGenres(),
    fetchDeezer<{ data: DeezerTrack[] }>(`/radio/genre/${genreId}/tracks?limit=${limit}`),
  ])
  const genre = genres.find((g) => g.id === genreId) || { id: genreId, name: "Unknown", picture: "" }
  return {
    genre,
    tracks: (tracksData.data || []).map(transformTrack),
  }
}

/** Search autocomplete suggestions (uses a quick search) */
export async function getSearchSuggestions(query: string) {
  if (!query.trim()) return { tracks: [], albums: [], artists: [] }
  const q = encodeURIComponent(query)
  const [tracks, albums, artists] = await Promise.all([
    fetchDeezer<{ data: DeezerTrack[] }>(`/search/track?q=${q}&limit=3`),
    fetchDeezer<{ data: DeezerAlbum[] }>(`/search/album?q=${q}&limit=3`),
    fetchDeezer<{ data: DeezerArtist[] }>(`/search/artist?q=${q}&limit=3`),
  ])
  return {
    tracks: (tracks.data || []).map(transformTrack),
    albums: (albums.data || []).map(transformAlbum),
    artists: (artists.data || []).map(transformArtist),
  }
}
