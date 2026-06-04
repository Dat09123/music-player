/**
 * Deezer Public API Client
 * Free, no authentication required for public data.
 * See: https://developers.deezer.com/api
 */

const API = "https://api.deezer.com"

// ─── Raw fetch ───────────────────────────────────────────

async function fetchDeezer<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Deezer API error (${res.status}): ${text.slice(0, 200)}`)
  }
  return res.json()
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
  return {
    id: String(t.id),
    name: t.title,
    artists: [{ id: String(t.artist.id), name: t.artist.name, type: "artist" as const, uri: "", images: [toImage(t.artist.picture_medium)], genres: [], followers: { href: null, total: 0 }, popularity: 0, external_urls: { spotify: "" } }],
    album: transformAlbum(t.album),
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
  return {
    id: String(a.id),
    name: a.title,
    type: "album" as const,
    album_type: "album" as const,
    artists: [{ id: String(a.artist.id), name: a.artist.name, type: "artist" as const, uri: "", images: [toImage(a.artist.picture_medium)], genres: [], followers: { href: null, total: 0 }, popularity: 0, external_urls: { spotify: "" } }],
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
    name: p.title,
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
  // Deezer's search returns { data: T[] } for all types, but with different T per type
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
  const result = await fetchDeezer<{ data: DeezerTrack[] }>(`/search/${type}?q=${encodeURIComponent(query)}&limit=${limit}`)
  return result.data || []
}

/** Get a single album with tracks */
export async function getAlbum(id: string) {
  const data = await fetchDeezer<DeezerAlbum>(`/album/${id}`)
  return transformAlbum(data)
}

/** Get a single artist */
export async function getArtist(id: string) {
  // Use explicit tuple type to break circular type inference (DeezerTrack ↔ DeezerAlbum)
  const [artistData, topTracksData, albumsData]: [any, any, any] = await Promise.all([
    fetchDeezer(`/artist/${id}`),
    fetchDeezer(`/artist/${id}/top?limit=10`),
    fetchDeezer(`/artist/${id}/albums?limit=10`),
  ])

  return {
    artist: transformArtist(artistData),
    topTracks: (topTracksData.data || []).map(transformTrack),
    albums: (albumsData.data || []).map(transformAlbum),
  }
}

/** Get related artists (not available on Deezer public API, return empty) */
export async function getRelatedArtists(_id: string) {
  return { artists: [] }
}

/** Get a single playlist with tracks */
export async function getPlaylist(id: string) {
  const data = await fetchDeezer<DeezerPlaylist>(`/playlist/${id}`)
  return transformPlaylist(data)
}

/** Get chart/featured content (replaces Spotify's featured playlists + new releases) */
export async function getChart() {
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
  const result = await fetchDeezer<{ data: DeezerTrack[] }>(`/search/track?q=${encodeURIComponent(query)}&limit=${limit}`)
  return (result.data || []).map(transformTrack)
}
