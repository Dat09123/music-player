"use client"

import { useState, useEffect, use, useCallback, useRef } from "react"
import Link from "next/link"
import { getGenreRadio } from "@/lib/deezer"
import { getGenreIcon, formatArtists, getImage, formatDuration } from "@/lib/utils"
import { usePlayer } from "@/components/Player"
import LazyImage from "@/components/LazyImage"
import Skeleton, { SkeletonTrackRow, LoadingSkeleton } from "@/components/Skeleton"
import { MusicNoteIcon, PlayIcon, ArrowRightIcon, WarningIcon, ChevronLeftIcon } from "@/components/Icons"
import type { PlayerTrack } from "@/components/Player"

interface Props {
  params: Promise<{ id: string }>
}

const genreEmojiBg: Record<string, string> = {
  Pop: "from-pink-500/20 via-rose-500/10 to-transparent",
  Rock: "from-amber-600/20 via-red-600/10 to-transparent",
  "Hip Hop": "from-yellow-500/20 via-orange-500/10 to-transparent",
  Jazz: "from-blue-600/20 via-indigo-700/10 to-transparent",
  Classical: "from-stone-500/20 via-amber-800/10 to-transparent",
  Electronic: "from-cyan-500/20 via-blue-600/10 to-transparent",
}

function getBg(name: string): string {
  for (const [key, bg] of Object.entries(genreEmojiBg)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return bg
  }
  return "from-[var(--accent)]/20 via-indigo-600/10 to-transparent"
}

export default function StationPage({ params }: Props) {
  const { id } = use(params)
  const genreId = parseInt(id, 10)

  const [genre, setGenre] = useState<{ id: number; name: string; picture: string } | null>(null)
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { playAll } = usePlayer()

  const loadData = useCallback(async () => {
    if (cancelledRef.current) return
    setLoading(true)
    setError(null)
    try {
      const data = await getGenreRadio(genreId, 20)
      if (!cancelledRef.current) {
        setGenre(data.genre)
        setTracks(data.tracks)
      }
    } catch (err: any) {
      if (!cancelledRef.current) setError(err?.message || "Failed to load station")
    } finally {
      if (!cancelledRef.current) setLoading(false)
    }
  }, [genreId])

  const cancelledRef = useRef(false)
  useEffect(() => {
    cancelledRef.current = false
    loadData()
    return () => { cancelledRef.current = true }
  }, [loadData])

  const playerTracks: PlayerTrack[] = tracks
    .filter((t) => t?.id)
    .map((t) => ({
      id: t.id,
      name: t.name,
      artists: formatArtists(t.artists || []),
      artistIds: (t.artists || []).map((a: any) => a.id),
      album: t.album?.name || "",
      albumId: t.album?.id || "",
      albumImage: getImage(t.album?.images, "sm"),
      duration: t.duration_ms || 0,
      previewUrl: t.preview_url,
      uri: t.uri,
    }))

  function handlePlayAll() {
    if (playerTracks.length > 0) playAll(playerTracks, 0)
  }

  function handlePlayTrack(index: number) {
    if (index < playerTracks.length) playAll(playerTracks, index)
  }

  if (loading) {
    return (
      <LoadingSkeleton>
        <div className="p-6 pb-20 max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton width={120} height={20} className="mb-2" />
            <Skeleton width={200} height={48} className="mb-2" />
            <Skeleton width={160} height={16} />
          </div>
          <SkeletonTrackRow count={10} />
        </div>
      </LoadingSkeleton>
    )
  }

  if (error || !genre) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <WarningIcon className="w-16 h-16 text-red-300 mb-4" strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Station not found</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">{error || "This station could not be loaded."}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="bg-[var(--accent)] hover:opacity-90 text-white font-medium px-5 py-2 rounded-lg text-sm transition-all"
          >
            Try again
          </button>
          <Link href="/stations" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline">
            <ChevronLeftIcon className="w-4 h-4" />
            Back to stations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className={`relative overflow-hidden bg-gradient-to-b ${getBg(genre.name)}`}>
        <div className="px-6 pt-16 pb-10 md:pt-24 md:pb-14">
          <Link href="/stations" className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4">
            <ChevronLeftIcon className="w-3.5 h-3.5" />
            Stations
          </Link>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Genre icon/image */}
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-br from-[var(--accent)] to-indigo-600 flex items-center justify-center">
              {genre.picture ? (
                <LazyImage src={genre.picture} alt={genre.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">{getGenreIcon(genre.name)}</span>
              )}
            </div>

            <div className="text-center sm:text-left min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Radio Station</p>
              <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-2">
                {genre.name}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {tracks.length} tracks • Curated by Deezer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={handlePlayAll}
          disabled={playerTracks.length === 0}
          className="w-14 h-14 bg-[var(--accent)] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Play all"
        >
          <PlayIcon className="w-6 h-6 text-white ml-0.5" />
        </button>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{genre.name} Radio</p>
          <p className="text-xs text-[var(--text-muted)]">{playerTracks.length} tracks</p>
        </div>
      </div>

      {/* Track list */}
      <div className="px-4 space-y-0.5">
        <div className="grid grid-cols-[32px_1fr_64px] gap-3 px-4 py-1.5 text-[11px] text-[var(--text-muted)] font-medium border-b border-[var(--border)]/50">
          <span className="text-center">#</span>
          <span>Title</span>
          <span className="text-right">
            <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>

        {tracks.length > 0 ? tracks.map((track: any, index: number) => (
          <div
            key={track.id}
            onClick={() => handlePlayTrack(index)}
            className="grid grid-cols-[32px_1fr_64px] gap-3 px-4 py-2 rounded-xl group cursor-pointer transition-all hover:bg-[var(--bg-hover)]/70 text-[var(--text-secondary)]"
          >
            <div className="flex items-center justify-center">
              <span className="group-hover:hidden text-xs tabular-nums text-[var(--text-muted)]">{index + 1}</span>
              <PlayIcon className="hidden group-hover:block w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              {track.album?.images && (
                <div className="w-10 h-10 rounded bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden hidden sm:block">
                  <LazyImage src={getImage(track.album.images, "sm")} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{track.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{formatArtists(track.artists || [])}</p>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs tabular-nums">{formatDuration(track.duration_ms || 0)}</span>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center py-16 text-[var(--text-muted)]">
            <MusicNoteIcon className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No tracks available for this station</p>
          </div>
        )}
      </div>
    </div>
  )
}
