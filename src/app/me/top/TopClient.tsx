"use client"

import { useState, useEffect } from "react"
import { usePlayer } from "@/components/Player"
import { formatArtists, getImage, formatDuration } from "@/lib/utils"
import { getChart } from "@/lib/deezer"
import type { PlayerTrack } from "@/lib/types"
import Link from "next/link"
import LazyImage from "@/components/LazyImage"
import Skeleton, { SkeletonTrackRow, SkeletonCardGrid } from "@/components/Skeleton"

export default function TopClient() {
  const [tracks, setTracks] = useState<any[]>([])
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { playAll } = usePlayer()

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      if (cancelled) return
      setLoading(true)
      setError(null)
      try {
        const chart = await getChart()
        if (!cancelled) {
          setTracks(chart.tracks?.slice(0, 20) || [])
          setArtists(chart.artists?.slice(0, 12) || [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [retryCount])

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
      <div className="p-6 space-y-8 pb-20">
        <Skeleton width={200} height={40} />
        <div>
          <Skeleton width={120} height={24} className="mb-5" />
          <SkeletonCardGrid count={6} aspect="circle" />
        </div>
        <div>
          <Skeleton width={120} height={24} className="mb-5" />
          <SkeletonTrackRow count={5} />
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
        <p className="text-lg font-medium text-[var(--text-primary)] mb-2">Failed to load top charts</p>
        <p className="text-sm text-[var(--text-muted)] mb-6">{error}</p>
        <button
          onClick={() => setRetryCount(c => c + 1)}
          className="bg-[var(--accent)] hover:opacity-90 text-white font-medium px-5 py-2 rounded-lg text-sm transition-all"
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
          <p className="text-sm text-[var(--text-secondary)] mt-1">Trending tracks and artists on Deezer</p>
        </div>
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
                className="group bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-xl p-4 transition-all text-center border border-[var(--border)]"
              >
                <div className="relative mb-3">
                  <div className="w-full aspect-square rounded-full overflow-hidden bg-[var(--bg-hover)] shadow-sm mx-auto">
                    {artist.images?.[0]?.url ? (
                      <LazyImage
                        src={artist.images[0].url}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                </div>
                <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{artist.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Artist</p>
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
                className="grid grid-cols-[40px_1fr_80px] gap-3 px-4 py-2.5 rounded-lg group cursor-pointer transition-all duration-200 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
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
                    <div className="w-10 h-10 rounded bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden hidden sm:block">
                      <LazyImage src={getImage(track.album.images, "sm")} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{track.name}</p>
                    <p className="text-xs truncate text-[var(--text-muted)]">
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
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm tabular-nums">{formatDuration(track.duration_ms || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {tracks.length === 0 && artists.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
          <svg className="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-lg font-medium text-[var(--text-primary)] mb-1">No charts available</p>
          <p className="text-sm">Check back later for updated charts</p>
        </div>
      )}
    </div>
  )
}
