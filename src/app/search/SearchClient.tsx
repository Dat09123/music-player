"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { getImage, formatArtists, formatDuration } from "@/lib/utils"
import { usePlayer } from "@/components/Player"
import type { PlayerTrack } from "@/components/Player"
import type { SpotifySearchResult, SpotifyTrack, SpotifyAlbum, SpotifyArtist, SpotifyPlaylist } from "@/lib/types"

type SearchCategory = "all" | "track" | "album" | "artist" | "playlist"

export default function SearchClient() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SpotifySearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<SearchCategory>("all")
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { playTrack, playAll } = usePlayer()

  const search = useCallback(async (q: string, cat: SearchCategory) => {
    if (!q.trim()) {
      setResults(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const types = cat === "all"
        ? "track,album,artist,playlist"
        : cat === "track" ? "track"
        : cat === "album" ? "album"
        : cat === "artist" ? "artist"
        : "playlist"

      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}&type=${types}&limit=8`)
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      setResults(data)
    } catch (e) {
      setError("Search failed. Check your API credentials.")
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query, category), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, category, search])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const categories: { key: SearchCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "track", label: "Songs" },
    { key: "album", label: "Albums" },
    { key: "artist", label: "Artists" },
    { key: "playlist", label: "Playlists" },
  ]

  const tracks = results?.tracks?.items || []
  const albums = results?.albums?.items || []
  const artists = results?.artists?.items || []
  const playlists = results?.playlists?.items || []

  function playTrackFromSearch(track: SpotifyTrack) {
    const playerTrack: PlayerTrack = {
      id: track.id,
      name: track.name,
      artists: formatArtists(track.artists || []),
      artistIds: (track.artists || []).map(a => a.id),
      album: track.album?.name || "",
      albumId: track.album?.id || "",
      albumImage: getImage(track.album?.images, "sm"),
      duration: track.duration_ms || 0,
      previewUrl: track.preview_url,
      uri: track.uri,
    }
    playTrack(playerTrack)
  }

  function playAllTracks() {
    const playerTracks: PlayerTrack[] = tracks.map(track => ({
      id: track.id,
      name: track.name,
      artists: formatArtists(track.artists || []),
      artistIds: (track.artists || []).map(a => a.id),
      album: track.album?.name || "",
      albumId: track.album?.id || "",
      albumImage: getImage(track.album?.images, "sm"),
      duration: track.duration_ms || 0,
      previewUrl: track.preview_url,
      uri: track.uri,
    }))
    if (playerTracks.length > 0) playAll(playerTracks, 0)
  }

  return (
    <div className="p-6 pb-28">
      {/* Search bar */}
      <div className="relative max-w-2xl mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full pl-12 pr-4 py-3.5 bg-zinc-800 text-white rounded-xl border border-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10 text-lg placeholder-zinc-500 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null) }}
            className="absolute inset-y-0 right-4 flex items-center text-zinc-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              category === key
                ? "bg-white text-black"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="w-12 h-12 rounded bg-zinc-800 skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-zinc-800 skeleton" />
                <div className="h-3 w-32 bg-zinc-800 skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex flex-col items-center py-16 text-zinc-500">
          <svg className="w-12 h-12 mb-4 text-red-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-lg font-medium mb-1">Search failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* No results */}
      {!loading && !error && query && results && tracks.length === 0 && albums.length === 0 && artists.length === 0 && playlists.length === 0 && (
        <div className="flex flex-col items-center py-16 text-zinc-500">
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium mb-1">No results found</p>
          <p className="text-sm">Try different keywords or check your spelling</p>
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div className="space-y-8">
          {/* Tracks */}
          {(category === "all" || category === "track") && tracks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Songs</h2>
                {tracks.length > 0 && (
                  <button
                    onClick={playAllTracks}
                    className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Play all
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                    onClick={() => playTrackFromSearch(track)}
                  >
                    <div className="w-12 h-12 rounded bg-zinc-800 flex-shrink-0 overflow-hidden">
                      {track.album?.images ? (
                        <img src={getImage(track.album.images, "sm")} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{track.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{formatArtists(track.artists || [])}</p>
                    </div>
                    <span className="text-xs text-zinc-500 tabular-nums">{formatDuration(track.duration_ms || 0)}</span>
                    <button className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-all">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(category === "all" || category === "album") && albums.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {albums.slice(0, 5).map((album) => (
                  <Link key={album.id} href={`/album/${album.id}`} className="group bg-zinc-900/40 hover:bg-zinc-800/60 rounded-xl p-4 transition-all">
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-3 shadow-lg">
                      <img src={getImage(album.images)} alt={album.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    <p className="font-semibold text-sm text-white truncate">{album.name}</p>
                    <p className="text-xs text-zinc-400 truncate mt-1">{album.artists?.map(a => a.name).join(", ")}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {(category === "all" || category === "artist") && artists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {artists.slice(0, 5).map((artist) => (
                  <Link key={artist.id} href={`/artist/${artist.id}`} className="group bg-zinc-900/40 hover:bg-zinc-800/60 rounded-xl p-4 transition-all text-center">
                    <div className="w-full aspect-square rounded-full overflow-hidden bg-zinc-800 mb-3 mx-auto shadow-lg">
                      <img src={getImage(artist.images)} alt={artist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    <p className="font-semibold text-sm text-white truncate">{artist.name}</p>
                    <p className="text-xs text-zinc-400 mt-1">Artist</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {(category === "all" || category === "playlist") && playlists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {playlists.slice(0, 5).map((playlist) => (
                  <Link key={playlist.id} href={`/playlist/${playlist.id}`} className="group bg-zinc-900/40 hover:bg-zinc-800/60 rounded-xl p-4 transition-all">
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-3 shadow-lg">
                      <img src={getImage(playlist.images)} alt={playlist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    <p className="font-semibold text-sm text-white truncate">{playlist.name}</p>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{playlist.description || `${playlist.tracks?.total || 0} tracks`}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Initial state */}
      {!loading && !query && !results && (
        <div className="flex flex-col items-center py-20 text-zinc-500">
          <svg className="w-24 h-24 mb-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-xl font-medium text-zinc-400 mb-2">Search millions of songs</p>
          <p className="text-sm">Find your favorite music, artists, and playlists</p>
        </div>
      )}
    </div>
  )
}
