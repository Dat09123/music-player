// Spotify API Response Types
export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyFollowers {
  href: string | null
  total: number
}

export interface SpotifyExternalUrls {
  spotify: string
}

export interface SpotifyArtist {
  id: string
  name: string
  type: "artist"
  uri: string
  images: SpotifyImage[]
  genres: string[]
  followers: SpotifyFollowers
  popularity: number
  external_urls: SpotifyExternalUrls
}

export interface SpotifyAlbum {
  id: string
  name: string
  type: "album"
  album_type: "album" | "single" | "compilation"
  artists: SpotifyArtist[]
  images: SpotifyImage[]
  release_date: string
  total_tracks: number
  uri: string
  external_urls: SpotifyExternalUrls
  label?: string
  popularity?: number
  tracks?: SpotifyPaging<SpotifyTrack>
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  duration_ms: number
  explicit: boolean
  popularity: number
  preview_url: string | null
  uri: string
  track_number: number
  disc_number: number
  external_urls: SpotifyExternalUrls
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: SpotifyImage[]
  owner: { id: string; display_name: string }
  public: boolean
  collaborative: boolean
  tracks: SpotifyPaging<SpotifyPlaylistTrack>
  uri: string
  external_urls: SpotifyExternalUrls
  followers: SpotifyFollowers
}

export interface SpotifyPlaylistTrack {
  added_at: string
  track: SpotifyTrack
}

export interface SpotifyCategory {
  id: string
  name: string
  icons: SpotifyImage[]
}

export interface SpotifyPaging<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  href: string
  next: string | null
  previous: string | null
}

export interface SpotifySearchResult {
  tracks: SpotifyPaging<SpotifyTrack>
  artists: SpotifyPaging<SpotifyArtist>
  albums: SpotifyPaging<SpotifyAlbum>
  playlists: SpotifyPaging<SpotifyPlaylist>
}

export interface SpotifyRecommendations {
  tracks: SpotifyTrack[]
}

export interface SpotifyUser {
  id: string
  display_name: string
  email: string
  images: SpotifyImage[]
  country: string
  product: string
  uri: string
  external_urls: SpotifyExternalUrls
}

export interface SpotifyDevice {
  id: string
  name: string
  type: string
  is_active: boolean
  is_restricted: boolean
  is_private_session: boolean
  volume_percent: number
}

export interface SpotifyPlayerState {
  device: SpotifyDevice | null
  repeat_state: "off" | "context" | "track"
  shuffle_state: boolean
  is_playing: boolean
  item: SpotifyTrack | null
  progress_ms: number
  timestamp: number
}

// App-level types
export type ItemType = "track" | "album" | "artist" | "playlist"

export interface PlayerTrack {
  id: string
  name: string
  artists: string
  artistIds: string[]
  album: string
  albumId: string
  albumImage: string
  duration: number
  previewUrl: string | null
  uri: string
}

export type RepeatMode = "off" | "all" | "one"
