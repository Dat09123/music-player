"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { usePlayer } from "@/components/Player"
import { getGenreRadio, searchByGenre } from "@/lib/deezer"
import { toPlayerTrack, getGenreIcon } from "@/lib/utils"
import TrackList from "@/components/TrackList"
import { TrackListSkeleton } from "@/components/Skeleton"
import { MusicNoteIcon, PlayIcon } from "@/components/Icons"

const genreGradients: Record<string, string> = {
  Pop: "from-pink-500 to-rose-500",
  Rock: "from-amber-600 to-red-600",
  "Hip Hop": "from-yellow-500 to-orange-500",
  Jazz: "from-blue-600 to-indigo-700",
  Classical: "from-stone-500 to-amber-800",
  Electronic: "from-cyan-500 to-blue-600",
  Dance: "from-purple-500 to-pink-500",
  RnB: "from-violet-500 to-purple-600",
  Soul: "from-red-400 to-rose-600",
  Reggae: "from-green-600 to-emerald-700",
  Blues: "from-sky-600 to-blue-700",
  Country: "from-amber-600 to-yellow-700",
  Metal: "from-gray-600 to-zinc-800",
  Indie: "from-teal-500 to-cyan-600",
  Folk: "from-lime-600 to-green-700",
  Latin: "from-red-500 to-orange-500",
  Alternative: "from-emerald-500 to-teal-600",
  Punk: "from-red-700 to-rose-800",
  Funk: "from-fuchsia-500 to-purple-600",
  Gospel: "from-amber-400 to-yellow-500",
}

function getGradient(name: string): string {
  for (const [key, gradient] of Object.entries(genreGradients)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return gradient
  }
  return "from-[var(--accent)] to-indigo-600"
}

const RADIO_BATCH_SIZE = 20

export default function GenreRadioPage() {
  const params = useParams()
  const genreId = Number(params.id)
  const { playAll, queue, queueIndex } = usePlayer()

  const [genre, setGenre] = useState<{ id: number; name: string; picture: string } | null>(null)
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [radioMode, setRadioMode] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // ALL hooks must be declared BEFORE any early return (React hooks rule)

  // Load initial tracks
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getGenreRadio(genreId, RADIO_BATCH_SIZE)
        if (!cancelled) {
          setGenre(data.genre)
          setTracks(data.tracks)
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load radio station")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [genreId])

  const playerTracks = useMemo(
    () => tracks.filter((t: any) => t?.id).map((t: any) => toPlayerTrack(t)),
    [tracks]
  )

  // Load more tracks when radio mode is active and queue is running low
  useEffect(() => {
    if (!radioMode || loadingMore || tracks.length === 0) return
    const remaining = queue.length - queueIndex - 1
    if (remaining <= 3) {
      setLoadingMore(true)
      searchByGenre(genreId, RADIO_BATCH_SIZE).then((newTracks) => {
        setTracks((prev) => {
          const existingIds = new Set(prev.map((t: any) => t.id))
          const fresh = newTracks.filter((t: any) => !existingIds.has(t.id))
          return fresh.length > 0 ? [...prev, ...fresh] : prev
        })
      }).finally(() => {
        setLoadingMore(false)
      })
    }
  }, [radioMode, loadingMore, tracks.length, queue.length, queueIndex, genreId])

  // Guard: invalid genreId (AFTER all hooks)
  if (!genreId || isNaN(genreId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Invalid station</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">This station could not be found</p>
        <a href="/stations" className="bg-[var(--accent)] hover:opacity-90 text-white font-medium px-5 py-2 rounded-lg text-sm transition-all">
          Browse Stations
        </a>
      </div>
    )
  }

  function startRadio() {
    setRadioMode(true)
    playAll(playerTracks, 0)
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 pb-20">
        <div className="animate-pulse">
          <div className="h-48 md:h-56 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 mb-6 flex items-end p-6">
            <div className="space-y-3">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-8 w-48 bg-white/10 rounded" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          </div>
          <TrackListSkeleton />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !genre) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Could not load station</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">{error || "Station not found"}</p>
        <a href="/stations" className="bg-[var(--accent)] hover:opacity-90 text-white font-medium px-5 py-2 rounded-lg text-sm transition-all">
          Browse Stations
        </a>
      </div>
    )
  }

  const gradient = getGradient(genre.name)
  const icon = getGenreIcon(genre.name)

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} px-6 pt-12 pb-8 md:pt-16 md:pb-10`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 50%, white 0.5px, transparent 0.5px)`,
            backgroundSize: "24px 24px",
          }} />
        </div>

        {/* Blurred genre image */}
        {genre.picture && (
          <div className="absolute inset-0 opacity-20">
            <img src={genre.picture} alt="" className="w-full h-full object-cover blur-2xl scale-110" />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          {/* Genre icon/image */}
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 flex-shrink-0 bg-black/20 flex items-center justify-center">
            {genre.picture ? (
              <img
                src={genre.picture}
                alt={genre.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl">{icon}</span>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Radio Station</p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">{genre.name}</h1>
            <p className="text-sm text-white/70">{tracks.length} tracks — endless radio</p>

            {/* Play / Radio button */}
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={startRadio}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Start Radio</span>
              </button>
              {radioMode && (
                <span className="flex items-center gap-1.5 text-xs text-white/60 animate-fade-in">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  Playing now
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="px-3 py-6">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Tracks</h2>
          <span className="text-xs text-[var(--text-muted)]">{tracks.length} songs</span>
        </div>

        {tracks.length > 0 ? (
          <TrackList
            tracks={tracks}
            playerTracks={playerTracks}
            showAlbum={true}
            showImage={true}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
            <MusicNoteIcon className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No tracks available for this genre</p>
          </div>
        )}
      </div>

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-[var(--text-muted)]">
          <span className="flex gap-0.5">
            <span className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
          Loading more tracks...
        </div>
      )}
    </div>
  )
}
