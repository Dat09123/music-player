"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import { usePlayer } from "@/components/Player"
import { formatArtists, getImage, formatDuration } from "@/lib/utils"
import { spotifyFetchDirect } from "@/lib/api-client"
import type { PlayerTrack } from "@/lib/types"
import type { SpotifyTrack, SpotifyArtist } from "@/lib/types"
import Link from "next/link"

type TimeRange = "short_term" | "medium_term" | "long_term"

const timeRangeLabels: Record<TimeRange, string> = {
  short_term: "Last 4 Weeks",
  medium_term: "Last 6 Months",
  long_term: "All Time",
}

export default function TopClient() {
  const { isAuthenticated, isLoading: authLoading, getToken, login } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term")
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [artists, setArtists] = useState<SpotifyArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { playAll } = usePlayer()

  // Fetch top items
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchTopItems() {
      try {
        if (cancelled) return

        const [tracksData, artistsData] = await Promise.all([
          spotifyFetchDirect<{ items: SpotifyTrack[] }>(
            `https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=${timeRange}`,
            {},
            getToken
          ),
          spotifyFetchDirect<{ items: SpotifyArtist[] }>(
            `https://api.spotify.com/v1/me/top/artists?limit=12&time_range=${timeRange}`,
            {},
            getToken
          ),
        ])

        if (!cancelled) {
          setTracks(tracksData.items || [])
          setArtists(artistsData.items || [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTopItems()
    return () => { cancelled = true }
  }, [isAuthenticated, timeRange, getToken, retryCount])

  // Build player tracks
  const playerTracks: PlayerTrack[] = tracks
    .filter((t) => t?.id)
    .map((track) => ({
      id: track.id,
      name: track.name,
      artists: formatArtists(track.artists || []),
      artistIds: (track.artists || []).map((a) => a.id),
      album: track.album?.name || "",
      albumId: track.album?.id || "",
      albumImage: getImage(track.album?.images, "sm"),
      duration: track.duration_ms || 0,
      previewUrl: track.preview_url,
      uri: track.uri,
    }))

  function playAllTracks() {
    if (playerTracks.length > 0) playAll(playerTracks, 0)
  }

  // Not logged in
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Your Top Charts</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">Log in with your Spotify account to see your most played tracks and artists.</p>
        <button
          onClick={login}
          className="bg-[var(--accent)] hover:opacity-90 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:shadow-sm"
        >
          Log in to Spotify
        </button>
      </div>
    )
  }

  // Loading
  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-8 pb-20">
        <div className="h-10 w-48 bg-gray-200 rounded-lg skeleton" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-28 bg-gray-200 rounded-full skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="w-full aspect-square rounded-full bg-gray-100 skeleton" />
              <div className="h-4 w-20 bg-gray-100 rounded skeleton mx-auto" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="w-10 h-10 bg-gray-100 rounded skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-100 rounded skeleton" />
                <div className="h-3 w-32 bg-gray-100 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <svg className="w-16 h-16 text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="text-lg font-medium text-[var(--text-primary)] mb-2">Failed to load your top charts</p>
        <p className="text-sm text-[var(--text-muted)] mb-4">{error}</p>
        <button onClick={() => setRetryCount((c) => c + 1)}
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)]">Top Charts</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Your most played tracks and artists</p>
        </div>
      </div>

      {/* Time range selector */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              timeRange === range
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "bg-white text-[var(--text-secondary)] border border-[var(--border)] hover:bg-gray-50"
            }`}
          >
            {timeRangeLabels[range]}
          </button>
        ))}
      </div>

      {/* Top Artists */}
      {artists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Top Artists</h2>
            <span className="text-xs text-[var(--text-muted)]">{artists.length} artists</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {artists.map((artist, index) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="group bg-white hover:bg-gray-50 rounded-xl p-4 transition-all text-center border border-[var(--border)]"
              >
                <div className="relative mb-3">
                  <div className="w-full aspect-square rounded-full overflow-hidden bg-gray-100 shadow-sm mx-auto">
                    {artist.images?.[0]?.url ? (
                      <img
                        src={artist.images[0].url}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Rank badge */}
                  <div className="absolute -top-1 -left-1 w-7 h-7 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  {/* Play button */}
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:opacity-90 hover:scale-105">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
                <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{artist.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {artist.genres?.slice(0, 2).join(", ") || "Artist"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Tracks */}
      {tracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Top Tracks</h2>
            <button
              onClick={playAllTracks}
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Play all
            </button>
          </div>

          <div className="space-y-0.5">
            <div className="grid grid-cols-[40px_1fr_80px] gap-3 px-4 py-2 text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]">
              <span className="text-center">#</span>
              <span>Title</span>
              <span className="text-right">
                <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="grid grid-cols-[40px_1fr_80px] gap-3 px-4 py-2.5 rounded-lg group cursor-pointer transition-all duration-200 hover:bg-gray-50 text-[var(--text-secondary)]"
                onClick={() => {
                  if (index < playerTracks.length) playAll(playerTracks, index)
                }}
              >
                <div className="flex items-center justify-center">
                  <span className="group-hover:hidden text-sm tabular-nums">{index + 1}</span>
                  <svg className="hidden group-hover:block w-4 h-4 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  {track.album?.images && (
                    <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden hidden sm:block">
                      <img src={getImage(track.album.images, "sm")} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{track.name}</p>
                    <p className="text-xs truncate text-[var(--text-muted)]">{formatArtists(track.artists || [])}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {track.explicit && (
                    <span className="text-[10px] bg-gray-200 text-[var(--text-muted)] font-bold px-1.5 py-0.5 rounded uppercase">E</span>
                  )}
                  <span className="text-sm tabular-nums">{formatDuration(track.duration_ms || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {tracks.length === 0 && artists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
          <svg className="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-lg font-medium text-[var(--text-primary)] mb-1">No top tracks yet</p>
          <p className="text-sm">Start listening to music to see your personalized top charts</p>
        </div>
      )}
    </div>
  )
}
