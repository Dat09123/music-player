"use client"

import { useState, useEffect, use } from "react"
import { getImage, formatDuration, formatArtists, formatNumber } from "@/lib/utils"
import { getTrack } from "@/lib/deezer"
import TrackClient from "./TrackClient"

interface Props {
  params: Promise<{ id: string }>
}

export default function TrackPage({ params }: Props) {
  const { id } = use(params)
  const [track, setTrack] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        if (cancelled) return
        setLoading(true)
        setError(null)

        const data = await getTrack(id)

        if (!cancelled) {
          setTrack(data)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Could not load track")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Hero skeleton */}
        <div className="relative overflow-hidden bg-gradient-to-b from-gray-200/50 dark:from-gray-800/50 to-zinc-900">
          <div className="px-6 pt-20 pb-8 md:pt-28 md:pb-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className="w-48 h-48 md:w-60 md:h-60 rounded-xl flex-shrink-0 shadow-2xl skeleton" />
              <div className="text-center md:text-left flex-1">
                <div className="h-4 w-16 skeleton rounded mb-3" />
                <div className="h-10 w-56 skeleton rounded mb-3" />
                <div className="h-4 w-64 skeleton rounded" />
              </div>
            </div>
          </div>
        </div>
        {/* Content skeleton */}
        <div className="bg-[var(--bg-secondary)]/50 px-3 py-4 space-y-6 pb-20">
          <div className="flex items-center gap-4 px-4">
            <div className="w-14 h-14 rounded-full skeleton" />
          </div>
          <section className="px-4">
            <div className="h-5 w-24 skeleton rounded mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-2">
                  <div className="w-5 h-5 skeleton rounded" />
                  <div className="w-10 h-10 rounded flex-shrink-0 skeleton" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-3.5 w-48 skeleton rounded" />
                    <div className="h-3 w-32 skeleton rounded" />
                  </div>
                  <div className="h-3 w-10 skeleton rounded" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (error || !track) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <svg className="w-16 h-16 text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Track not found</h2>
        <p className="text-sm text-[var(--text-muted)]">{error || "This track could not be loaded."}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/80 to-zinc-900 z-10" />
        {track.album?.images?.[0]?.url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${track.album.images[0].url})`, filter: "blur(60px)", opacity: 0.4, transform: "scale(1.2)" }}
          />
        )}

        <div className="relative z-20 px-6 pt-20 pb-8 md:pt-28 md:pb-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="w-48 h-48 md:w-60 md:h-60 rounded-xl overflow-hidden shadow-2xl ring-4 ring-white/10 flex-shrink-0">
              {track.album?.images?.[0]?.url ? (
                <img
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                  <svg className="w-24 h-24 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="text-center md:text-left min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">Song</p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 leading-tight">
                {track.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap text-sm">
                <span className="text-zinc-300 font-medium">{track.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist"}</span>
                <span className="text-zinc-600">•</span>
                <a
                  href={`/album/${track.album?.id || ""}`}
                  className="text-zinc-300 hover:text-white hover:underline transition-all"
                >
                  {track.album?.name || "Unknown Album"}
                </a>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">{formatDuration(track.duration)}</span>
                {track.explicit && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-[10px] bg-zinc-500/30 text-zinc-300 font-bold px-1.5 py-0.5 rounded uppercase leading-none">E</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <TrackClient track={track} />
    </div>
  )
}
