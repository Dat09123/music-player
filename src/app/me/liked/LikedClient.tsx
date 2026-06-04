"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import { usePlayer } from "@/components/Player"
import TrackList from "@/components/TrackList"
import { formatArtists, getImage } from "@/lib/utils"
import { spotifyFetchDirect } from "@/lib/api-client"
import type { PlayerTrack } from "@/lib/types"
import type { SpotifyTrack } from "@/lib/types"

interface SavedTrack {
  added_at: string
  track: SpotifyTrack
}

export default function LikedClient() {
  const { isAuthenticated, isLoading: authLoading, getToken, login } = useAuth()
  const { playAll } = usePlayer()
  const [tracks, setTracks] = useState<SavedTrack[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchLikedTracks() {
      try {
        if (cancelled) return

        const data = await spotifyFetchDirect<{ items: SavedTrack[]; total: number }>(
          "https://api.spotify.com/v1/me/tracks?limit=50&offset=0",
          {},
          getToken
        )

        if (!cancelled) {
          setTracks(data.items || [])
          setTotal(data.total || 0)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLikedTracks()
    return () => { cancelled = true }
  }, [isAuthenticated, getToken, retryCount])

  // Build player tracks
  const playerTracks: PlayerTrack[] = tracks
    .filter((item) => item?.track?.id)
    .map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artists: formatArtists(item.track.artists || []),
      artistIds: (item.track.artists || []).map((a) => a.id),
      album: item.track.album?.name || "",
      albumId: item.track.album?.id || "",
      albumImage: getImage(item.track.album?.images, "sm"),
      duration: item.track.duration_ms || 0,
      previewUrl: item.track.preview_url,
      uri: item.track.uri,
    }))

  function playAllTracks() {
    if (playerTracks.length > 0) playAll(playerTracks, 0)
  }

  // Not logged in
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Your Liked Songs</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
          Log in with your Spotify account to see all the songs you&apos;ve liked.
        </p>
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
      <div>
        <div className="bg-gradient-to-b from-purple-100 via-pink-50 to-[var(--bg-primary)] px-6 pt-16 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl bg-gray-200 skeleton shadow-2xl" />
            <div className="text-center md:text-left space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded skeleton" />
              <div className="h-10 w-48 bg-gray-200 rounded skeleton" />
              <div className="h-4 w-36 bg-gray-200 rounded skeleton" />
            </div>
          </div>
        </div>
        <div className="px-3 py-4 space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="w-10 h-10 rounded bg-gray-100 skeleton" />
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
        <p className="text-lg font-medium text-[var(--text-primary)] mb-2">Failed to load liked songs</p>
        <p className="text-sm text-[var(--text-muted)] mb-4">{error}</p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Gradient header */}
      <div className="bg-gradient-to-b from-purple-100 via-pink-50 to-[var(--bg-primary)] px-6 pt-12 pb-8 md:pt-20 md:pb-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          {/* Cover */}
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center">
            <svg className="w-24 h-24 text-white/80" fill="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>

          <div className="text-center md:text-left min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Playlist</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] mb-3 leading-tight">
              Liked Songs
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">{total} songs</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="text-[var(--text-muted)]">Your favorite tracks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/50 px-3 py-4">
        {/* Play controls */}
        {tracks.length > 0 && (
          <div className="flex items-center gap-4 px-4 py-2 mb-4">
            <button
              onClick={playAllTracks}
              className="w-14 h-14 bg-[var(--accent)] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl hover:opacity-90"
            >
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}

        {/* Track list */}
        {tracks.length > 0 ? (
          <TrackList
            tracks={tracks}
            showAlbum={true}
            showImage={true}
            showIndex={true}
            startIndex={0}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
            <svg className="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-lg font-medium text-[var(--text-primary)] mb-1">No liked songs yet</p>
            <p className="text-sm">Tap the heart icon on any song to add it to your collection</p>
          </div>
        )}

        {/* Footer */}
        {tracks.length > 0 && (
          <div className="px-4 py-6 text-xs text-[var(--text-muted)]">
            {total} liked songs
          </div>
        )}
      </div>
    </div>
  )
}
