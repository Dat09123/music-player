"use client"

import { useState, useEffect, use } from "react"
import { getImage, formatDate } from "@/lib/utils"
import { getAlbum } from "@/lib/deezer"
import AlbumClient from "./AlbumClient"

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

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Hero skeleton */}
        <div className="px-6 pt-12 pb-8 md:pt-20 md:pb-10 bg-gradient-to-b from-gray-100 dark:from-gray-800 to-[var(--bg-primary)]">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl flex-shrink-0 shadow-2xl skeleton" />
            <div className="text-center md:text-left flex-1">
              <div className="h-4 w-16 skeleton rounded mb-2" />
              <div className="h-10 w-64 skeleton rounded mb-3" />
              <div className="h-4 w-64 skeleton rounded" />
            </div>
          </div>
        </div>
        {/* Track list skeleton */}
        <div className="bg-white/50 px-3 py-4">
          <div className="flex items-center gap-4 px-4 py-2 mb-4">
            <div className="w-14 h-14 rounded-full skeleton" />
          </div>
          <div className="space-y-2 px-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <div className="w-5 h-5 skeleton rounded" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="h-3.5 w-48 skeleton rounded" />
                  <div className="h-3 w-32 skeleton rounded" />
                </div>
                <div className="h-3 w-10 skeleton rounded" />
              </div>
            ))}
          </div>
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
              <img src={album.images[0].url} alt={album.name} className="w-full h-full object-cover" />
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
      <AlbumClient album={album} />
    </div>
  )
}
