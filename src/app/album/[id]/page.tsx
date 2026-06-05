"use client"

import { useState, useEffect, use } from "react"
import dynamic from "next/dynamic"
import { getImage, formatDate } from "@/lib/utils"
import { getAlbum } from "@/lib/deezer"
import Skeleton, { SkeletonTrackRow } from "@/components/Skeleton"
import LazyImage from "@/components/LazyImage"
import { trackPageView } from "@/lib/recently-viewed"

const AlbumContent = dynamic(() => import("./AlbumClient"), {
  loading: () => (
    <div className="px-3 py-4 animate-fade-in">
      <div className="flex items-center gap-4 px-4 py-2 mb-4"><Skeleton variant="circle" width={56} height={56} /></div>
      <SkeletonTrackRow count={8} showImage={false} />
    </div>
  ),
})

interface Props {
  params: Promise<{ id: string }>
}

export default function AlbumPage({ params }: Props) {
  const { id } = use(params)
  const [album, setAlbum] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const data = await getAlbum(id)
        if (!cancelled) {
          setAlbum(data)
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not load album")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!album) return
    trackPageView({
      id: album.id,
      type: "album",
      name: album.name,
      imageUrl: getImage(album.images),
      subtext: album.artists?.map((a: any) => a.name).join(", "),
      href: `/album/${album.id}`,
    })
  }, [album?.id])

  if (loading) {
    return (
      <div>
        {/* Hero skeleton */}
        <div className="px-6 pt-12 pb-8 md:pt-20 md:pb-10 bg-gradient-to-b from-gray-100 dark:from-gray-800 to-[var(--bg-primary)]">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <Skeleton variant="hero-image" width={200} height={200} />
            <div className="text-center md:text-left flex-1 space-y-3">
              <Skeleton width={64} height={16} />
              <Skeleton width={250} height={40} />
              <Skeleton width={250} height={16} />
            </div>
          </div>
        </div>
        {/* Track list skeleton */}
        <div className="px-3 py-4">
          <div className="flex items-center gap-4 px-4 py-2 mb-4">
            <Skeleton variant="circle" width={56} height={56} />
          </div>
          <SkeletonTrackRow count={8} showImage={false} />
        </div>
      </div>
    )
  }

  if (error || !album) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <svg className="w-16 h-16 text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Album not found</h2>
        <p className="text-sm text-[var(--text-muted)]">{error || "This album could not be loaded."}</p>
      </div>
    )
  }

  const totalDuration = (album.tracks?.items || []).reduce((sum: number, t: any) => sum + (t.duration_ms || 0), 0)
  const totalMinutes = Math.floor(totalDuration / 60000)

  return (
    <div>
      <div className="relative px-6 pt-12 pb-8 md:pt-20 md:pb-10 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)]">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
            {album.images?.[0]?.url ? (
              <LazyImage src={album.images[0].url} alt={album.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--bg-hover)] flex items-center justify-center">
                <svg className="w-20 h-20 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
              </div>
            )}
          </div>
          <div className="text-center md:text-left min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Album</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] mb-3 leading-tight">{album.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm flex-wrap text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                {album.artists?.map((a: any, i: number) => (
                  <span key={a.id}>{i > 0 && <span className="mx-1">,</span>}{a.name}</span>
                ))}
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span>{formatDate(album.release_date)}</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span>{album.total_tracks} songs</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span>{totalMinutes} min</span>
            </div>
          </div>
        </div>
      </div>
      <AlbumContent album={album} />
    </div>
  )
}
