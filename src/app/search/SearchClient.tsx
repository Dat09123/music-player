"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { getImage, formatArtists, formatDuration, getGenreIcon } from "@/lib/utils"
import { usePlayer } from "@/components/Player"
import { searchAll, getGenres, getSearchSuggestions } from "@/lib/deezer"
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from "@/lib/recent-searches"
import type { PlayerTrack } from "@/components/Player"
import type { SpotifySearchResult, SpotifyTrack } from "@/lib/types"

export default function SearchClient() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SpotifySearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [genres, setGenres] = useState<{ id: number; name: string; picture: string }[]>([])
  const [suggestions, setSuggestions] = useState<{ tracks: any[]; albums: any[]; artists: any[] } | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const suggestRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestPanelRef = useRef<HTMLDivElement>(null)
  const { playTrack, playAll } = usePlayer()

  // Load genres on mount
  useEffect(() => {
    async function loadGenres() {
      try {
        const data = await getGenres()
        setGenres(data)
      } catch {}
    }
    loadGenres()
    setRecentSearches(getRecentSearches())
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    if (!showSuggestions) return
    function handleClick(e: MouseEvent) {
      if (suggestPanelRef.current && !suggestPanelRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showSuggestions])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    setError(null)
    setShowSuggestions(false)
    addRecentSearch(q)
    setRecentSearches(getRecentSearches())

    try {
      const data = await searchAll(q)
      setResults(data)
    } catch (e: any) {
      setError(e?.message || "Search failed. Please try again.")
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch suggestions while typing (debounced)
  useEffect(() => {
    if (suggestRef.current) clearTimeout(suggestRef.current)
    if (!query.trim() || loading) {
      setSuggestions(null)
      return
    }
    suggestRef.current = setTimeout(async () => {
      try {
        const data = await getSearchSuggestions(query)
        setSuggestions(data)
        setShowSuggestions(true)
      } catch {}
    }, 200)
    return () => { if (suggestRef.current) clearTimeout(suggestRef.current) }
  }, [query, loading])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, doSearch])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSearch(q: string) {
    setQuery(q)
    doSearch(q)
  }

  function handleGenreClick(genreId: number, genreName: string) {
    setQuery(genreName)
    doSearch(genreName)
  }

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
    <div className="p-6 pb-20 max-w-5xl mx-auto">
      {/* Search bar */}
      <div className="relative max-w-2xl mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions || recentSearches.length > 0) setShowSuggestions(true) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { setShowSuggestions(false); doSearch(query) } if (e.key === 'Escape') setShowSuggestions(false) }}
          placeholder="What do you want to listen to?"
          className="w-full pl-12 pr-8 py-3.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 text-lg placeholder-[var(--text-muted)] transition-all shadow-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); setSuggestions(null); setShowSuggestions(false) }}
            className="absolute inset-y-0 right-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Autocomplete dropdown */}
        {showSuggestions && (query.trim() ? suggestions : recentSearches.length > 0) && (
          <div
            ref={suggestPanelRef}
            className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] rounded-xl shadow-xl border border-[var(--border)] z-50 overflow-hidden animate-scale-in"
          >
            {query.trim() && suggestions ? (
              <div className="py-1 max-h-80 overflow-y-auto">
                {suggestions.tracks.length > 0 && (
                  <>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Tracks</p>
                    {suggestions.tracks.slice(0, 3).map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => handleSearch(t.name)}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </>
                )}
                {suggestions.artists.length > 0 && (
                  <>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Artists</p>
                    {suggestions.artists.slice(0, 3).map((a: any) => (
                      <Link
                        key={a.id}
                        href={`/artist/${a.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        <span className="truncate">{a.name}</span>
                      </Link>
                    ))}
                  </>
                )}
                {suggestions.albums.length > 0 && (
                  <>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Albums</p>
                    {suggestions.albums.slice(0, 3).map((al: any) => (
                      <Link
                        key={al.id}
                        href={`/album/${al.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                        <span className="truncate">{al.name}</span>
                      </Link>
                    ))}
                  </>
                )}
                <div className="border-t border-[var(--border)] px-4 py-2">
                  <button
                    onClick={() => { setShowSuggestions(false); doSearch(query) }}
                    className="w-full text-xs text-center text-[var(--accent)] hover:underline font-medium"
                  >
                    See all results for "{query}"
                  </button>
                </div>
              </div>
            ) : recentSearches.length > 0 && !query.trim() ? (
              <div className="py-1">
                <div className="flex items-center justify-between px-4 py-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Recent Searches</p>
                  <button
                    onClick={() => { clearRecentSearches(); setRecentSearches([]) }}
                    className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.slice(0, 6).map((s) => (
                  <div key={s} className="flex items-center gap-1 px-4 pr-2">
                    <button
                      onClick={() => handleSearch(s)}
                      className="flex items-center gap-3 flex-1 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{s}</span>
                    </button>
                    <button
                      onClick={() => { removeRecentSearch(s); setRecentSearches(getRecentSearches()) }}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-1">
          {/* Animated search indicator */}
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-muted)]">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
            <span>Searching...</span>
          </div>
          {[
            { title: "75%", artist: "50%" },
            { title: "60%", artist: "40%" },
            { title: "85%", artist: "55%" },
            { title: "55%", artist: "35%" },
            { title: "70%", artist: "45%" },            ].map((w, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="w-12 h-12 rounded skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton rounded" style={{ width: w.title }} />
                <div className="h-3 skeleton rounded" style={{ width: w.artist }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && !results && (
        <div className="flex flex-col items-center py-16 text-[var(--text-muted)]">
          <svg className="w-12 h-12 mb-4 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-lg font-medium text-[var(--text-primary)] mb-1">Search failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* No results */}
      {!loading && !error && query && results && tracks.length === 0 && albums.length === 0 && artists.length === 0 && playlists.length === 0 && (
        <div className="flex flex-col items-center py-16 text-[var(--text-muted)]">
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium text-[var(--text-primary)] mb-1">No results found</p>
          <p className="text-sm">Try different keywords or check your spelling</p>
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div className="space-y-8">
          {/* Tracks */}
          {tracks.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Songs</h2>
              <div className="space-y-1">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer group transition-colors"
                    onClick={() => playTrackFromSearch(track)}
                  >                      <div className="w-12 h-12 rounded bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden">
                      {track.album?.images ? (
                        <img src={getImage(track.album.images, "sm")} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{track.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {(track.artists || []).map((artist: any, i: number) => (
                          <span key={artist.id}>
                            <Link
                              href={`/artist/${artist.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-[var(--accent)] hover:underline transition-colors"
                            >
                              {artist.name}
                            </Link>
                            {i < (track.artists?.length || 0) - 1 && <span>, </span>}
                          </span>
                        ))}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] tabular-nums">{formatDuration(track.duration_ms || 0)}</span>
                    <button className="opacity-0 group-hover:opacity-100 text-[var(--accent)] hover:text-[var(--accent)] transition-all">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {albums.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {albums.slice(0, 5).map((album) => (
                  <Link key={album.id} href={`/album/${album.id}`} className="group bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-xl p-4 transition-all border border-[var(--border)]">
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-[var(--bg-hover)] mb-3 shadow-sm">
                      <img src={getImage(album.images)} alt={album.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{album.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-1">{album.artists?.map(a => a.name).join(", ")}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {artists.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {artists.slice(0, 5).map((artist) => (
                  <Link key={artist.id} href={`/artist/${artist.id}`} className="group bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-xl p-4 transition-all text-center border border-[var(--border)]">
                    <div className="w-full aspect-square rounded-full overflow-hidden bg-[var(--bg-hover)] mb-3 mx-auto shadow-sm">
                      <img src={getImage(artist.images)} alt={artist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{artist.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Artist</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {playlists.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {playlists.slice(0, 5).map((playlist) => (
                  <Link key={playlist.id} href={`/playlist/${playlist.id}`} className="group bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-xl p-4 transition-all border border-[var(--border)]">
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-[var(--bg-hover)] mb-3 shadow-sm">
                      <img src={getImage(playlist.images)} alt={playlist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{playlist.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">{playlist.description || `${playlist.tracks?.total || 0} tracks`}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Initial state - Genre cards */}
      {!loading && !query && !results && (
        <>
          <div className="flex flex-col items-center py-8 text-[var(--text-muted)]">
            <svg className="w-20 h-20 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-18 0 7 7 0 0118 0z" />
            </svg>
            <p className="text-xl font-medium text-[var(--text-primary)] mb-1">Search millions of songs</p>
            <p className="text-sm">Find your favorite music, artists, and playlists</p>
          </div>

          {/* Genre quick browse */}
          {genres.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Browse by Genre</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {genres.slice(0, 15).map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreClick(genre.id, genre.name)}
                    className="group relative overflow-hidden rounded-xl aspect-[3/2] bg-gradient-to-br from-[var(--bg-hover)] to-[var(--border)] hover:from-[var(--accent-light)] hover:to-[var(--accent)]/20 transition-all duration-300 p-4 flex items-end border border-[var(--border)] hover:border-[var(--accent)]/30"
                  >
                    {genre.picture && (
                      <img
                        src={genre.picture}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                        loading="lazy"
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="text-xl">{getGenreIcon(genre.name)}</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{genre.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
