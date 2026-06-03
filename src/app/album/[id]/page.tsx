"use client"

import { useState, useEffect, use } from "react"
import { useAuth } from "@/lib/AuthContext"
import { spotifyFetch } from "@/lib/api-client"
import { getImage, formatDate, formatNumber } from "@/lib/utils"
import AlbumClient from "./AlbumClient"

interface Props {
  params: Promise<{ id: string }>
}

export default function AlbumPage({ params }: Props) {
  const { id } = use(params)
  const { isAuthenticated, isLoading: authLoading, getToken } = useAuth()
  const [album, setAlbum] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const token = await getToken()
        if (!token || cancelled) {
          if (!cancelled) setLoading(false)
          return
        }

        const data = await spotifyFetch(`albums/${id}`, token)
        if (!cancelled) {
          setAlbum(data)
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Could not load album")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (!authLoading) loadData()
    return () => { cancelled = true }
  }, [id, authLoading, getToken])

  if (authLoading || loading) {
    return (
      <div className="animate-pulse px-6 pt-12 pb-8 md:pt-20 md:pb-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="text-center md:text-left flex-1">
            <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-10 w-64 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Log in to view album details</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Sign in with Spotify to see album tracks and more.</p>
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

  const totalDuration = (album.tracks?.items || []).reduce(
    (sum: number, t: any) => sum + (t.duration_ms || 0),
    0
  )
  const totalMinutes = Math.floor(totalDuration / 60000)

  return (
    <div>
      {/* Header */}
      <div className="relative px-6 pt-12 pb-8 md:pt-20 md:pb-10 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)]">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
            {album.images?.[0]?.url ? (
              <img
                src={album.images[0].url}
                alt={album.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <svg className="w-20 h-20 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-center md:text-left min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              {album.album_type === "single" ? "Single" : album.album_type === "compilation" ? "Compilation" : "Album"}
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] mb-3 leading-tight">
              {album.name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm flex-wrap text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                {album.artists?.map((a: any, i: number) => (
                  <span key={a.id}>
                    {i > 0 && <span className="mx-1">,</span>}
                    {a.name}
                  </span>
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

      {/* Track list */}
      <AlbumClient album={album} />
    </div>
  )
}
