const SPOTIFY_API = "https://api.spotify.com/v1"
const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com/api"

let cachedToken: { token: string; expiresAt: number } | null = null

async function getClientCredentialsToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    // On Vercel, check if env vars are set via process.env
    const isVercel = !!process.env.VERCEL
    const msg = isVercel
      ? "Missing Spotify credentials on Vercel. Go to Vercel Dashboard > Settings > Environment Variables and add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET."
      : "Missing Spotify credentials. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local"
    throw new Error(msg)
  }

  const res = await fetch(`${SPOTIFY_ACCOUNTS}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Spotify token error: ${res.status} ${error}`)
  }

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60000, // 1 min buffer
  }
  return cachedToken.token
}

async function fetchSpotify<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getClientCredentialsToken()
  const res = await fetch(`${SPOTIFY_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Spotify API error (${res.status}): ${error}`)
  }

  return res.json()
}

// Search
export async function searchSpotify(q: string, type: string = "track,artist,album,playlist", limit: number = 10) {
  const params = new URLSearchParams({ q, type, limit: String(limit) })
  return fetchSpotify<any>(`/search?${params}`)
}

// Browse
export async function getFeaturedPlaylists() {
  return fetchSpotify<any>("/browse/featured-playlists?country=VN&limit=10")
}

export async function getCategories() {
  return fetchSpotify<any>("/browse/categories?country=VN&limit=10")
}

export async function getCategoryPlaylists(categoryId: string) {
  return fetchSpotify<any>(`/browse/categories/${categoryId}/playlists?country=VN&limit=10`)
}

export async function getNewReleases() {
  return fetchSpotify<any>("/browse/new-releases?country=VN&limit=10")
}

// Playlists
export async function getPlaylist(id: string) {
  return fetchSpotify<any>(`/playlists/${id}`)
}

export async function getPlaylistTracks(id: string, limit: number = 50, offset: number = 0) {
  return fetchSpotify<any>(`/playlists/${id}/tracks?limit=${limit}&offset=${offset}`)
}

// Albums
export async function getAlbum(id: string) {
  return fetchSpotify<any>(`/albums/${id}`)
}

export async function getAlbumTracks(id: string, limit: number = 50, offset: number = 0) {
  return fetchSpotify<any>(`/albums/${id}/tracks?limit=${limit}&offset=${offset}`)
}

// Artists
export async function getArtist(id: string) {
  return fetchSpotify<any>(`/artists/${id}`)
}

export async function getArtistTopTracks(id: string) {
  return fetchSpotify<any>(`/artists/${id}/top-tracks?market=VN`)
}

export async function getArtistAlbums(id: string) {
  return fetchSpotify<any>(`/artists/${id}/albums?include_groups=album,single&limit=10`)
}

export async function getRelatedArtists(id: string) {
  return fetchSpotify<any>(`/artists/${id}/related-artists`)
}

// Recommendations
export async function getRecommendations(seedTracks?: string[], seedArtists?: string[], seedGenres?: string[]) {
  const params = new URLSearchParams()
  if (seedTracks?.length) params.set("seed_tracks", seedTracks.join(","))
  if (seedArtists?.length) params.set("seed_artists", seedArtists.join(","))
  if (seedGenres?.length) params.set("seed_genres", seedGenres.join(","))
  params.set("limit", "10")
  return fetchSpotify<any>(`/recommendations?${params}`)
}

// Categories
export async function getCategoryPlaylistsById(id: string) {
  return fetchSpotify<any>(`/browse/categories/${id}/playlists`)
}

export { getClientCredentialsToken, fetchSpotify }
