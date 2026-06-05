"use client"

import { useState, useEffect, use } from "react"
import dynamic from "next/dynamic"
import { getImage, formatDuration, formatArtists, formatNumber } from "@/lib/utils"
import { getTrack } from "@/lib/deezer"
import Skeleton, { SkeletonTrackRow } from "@/components/Skeleton"
import LazyImage from "@/components/LazyImage"
import { trackPageView } from "@/lib/recently-viewed"

const TrackContent = dynamic(() => import("./TrackClient"), {
  loading: () => (
    <div className="px-3 py-4 space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center gap-4 px-4"><Skeleton variant="circle" width={56} height={56} /></div>
      <section className="px-4"><Skeleton width={96} height={20} className="mb-4" /><SkeletonTrackRow count={5} /></section>
    </div>
  ),
})

interface Props {
  params: Promise<{ id: string }>
}

export default function TrackPage({ params }: Props) {
  const { id } = use(params)
  const [track, setTrack] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!track) return
    trackPageView({
      id: track.id,
      type: "track",
      name: track.name,
      imageUrl: getImage(track.album?.images),
      subtext: track.artists?.map((a: any) => a.name).join(", "),
      href: `/track/${track.id}`,
    })
  }, [track?.id])

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
      <div>
        {/* Hero skeleton */}
        <div className="relative overflow-hidden bg-gradient-to-b from-gray-200/50 dark:from-gray-800/50 to-zinc-900">
          <div className="px-6 pt-20 pb-8 md:pt-28 md:pb-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <Skeleton variant="hero-image" width={200} height={200} className="ring-4 ring-white/10" />
              <div className="text-center md:text-left flex-1 space-y-3">
                <Skeleton width={64} height={16} />
                <Skeleton width={250} height={40} />
                <Skeleton width={250} height={16} />
              </div>
            </div>
          </div>
        </div>
        {/* Content skeleton */}
        <div className="px-3 py-4 space-y-6 pb-20">
          <div className="flex items-center gap-4 px-4">
            <Skeleton variant="circle" width={56} height={56} />
          </div>
          <section className="px-4">
            <Skeleton width={96} height={20} className="mb-4" />
            <SkeletonTrackRow count={5} />
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
                <LazyImage
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

      {/* Content (lazy loaded) */}
      <TrackContent track={track} />
    </div>
  )
}
