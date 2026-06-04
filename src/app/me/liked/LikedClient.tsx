"use client"

import { useState, useEffect } from "react"
import { usePlayer } from "@/components/Player"
import TrackList from "@/components/TrackList"
import { formatArtists, getImage } from "@/lib/utils"
import { getChart } from "@/lib/deezer"
import type { PlayerTrack } from "@/lib/types"

export default function LikedClient() {
  const { playAll } = usePlayer()
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchTracks() {
      try {
        if (cancelled) return
        const chart = await getChart()
        if (!cancelled) {
          setTracks(chart.tracks?.slice(0, 50) || [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTracks()
    return () => { cancelled = true }
  }, [])

  // Build player tracks
  const playerTracks: PlayerTrack[] = tracks
    .filter((t) => t?.id)
    .map((track) => ({
      id: track.id,
      name: track.name,
      artists: formatArtists(track.artists || []),
      artistIds: (track.artists || []).map((a: any) => a.id),
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

  // Loading
  if (loading) {
    return (
      <div>
        <div className="bg-gradient-to-b from-purple-100 via-pink-50 to-[var(--bg-primary)] dark:from-purple-950/30 dark:via-pink-950/20 dark:to-[var(--bg-primary)] px-6 pt-16 pb-8">
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
        <p className="text-lg font-medium text-[var(--text-primary)] mb-2">Failed to load tracks</p>
        <p className="text-sm text-[var(--text-muted)] mb-4">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Gradient header */}
      <div className="bg-gradient-to-b from-purple-100 via-pink-50 to-[var(--bg-primary)] dark:from-purple-950/30 dark:via-pink-950/20 dark:to-[var(--bg-primary)] px-6 pt-12 pb-8 md:pt-20 md:pb-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          {/* Cover */}
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center">
            <svg className="w-24 h-24 text-white/80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>

          <div className="text-center md:text-left min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Deezer Charts</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] mb-3 leading-tight">
              Trending Now
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">{tracks.length} songs</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="text-[var(--text-muted)]">Top trending tracks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[var(--bg-secondary)]/50 px-3 py-4">
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
            tracks={tracks.filter(t => t.id)}
            showAlbum={true}
            showImage={true}
            showIndex={true}
            startIndex={0}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
            <svg className="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="text-lg font-medium text-[var(--text-primary)] mb-1">No tracks available</p>
            <p className="text-sm">Check back later for trending tracks</p>
          </div>
        )}

        {/* Footer */}
        {tracks.length > 0 && (
          <div className="px-4 py-6 text-xs text-[var(--text-muted)]">
            {tracks.length} trending tracks • Powered by Deezer
          </div>
        )}
      </div>
    </div>
  )
}
