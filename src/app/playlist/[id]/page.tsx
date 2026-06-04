"use client"

import { useState, useEffect, use } from "react"
import { getImage, formatNumber } from "@/lib/utils"
import { getPlaylist } from "@/lib/deezer"
import PlaylistClient from "./PlaylistClient"
import Skeleton, { SkeletonTrackRow } from "@/components/Skeleton"
import { trackPageView } from "@/lib/recently-viewed"

interface Props {
  params: Promise<{ id: string }>
}

export default function PlaylistPage({ params }: Props) {
  const { id } = use(params)
  const [playlist, setPlaylist] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const data = await getPlaylist(id)
        if (!cancelled) {
          setPlaylist(data)
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not load playlist")
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
        <div className="px-6 pt-12 pb-8 md:pt-20 md:pb-10 skeleton-pulse">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <Skeleton variant="hero-image" width={200} height={200} />
            <div className="text-center md:text-left flex-1 space-y-3">
              <Skeleton width={64} height={16} />
              <Skeleton width={250} height={40} />
              <Skeleton width={200} height={16} />
            </div>
          </div>
        </div>
        {/* Track list skeleton */}
        <div className="px-3 py-4">
          <div className="flex items-center gap-4 px-4 py-2 mb-4">
            <Skeleton variant="circle" width={56} height={56} />
            <Skeleton variant="circle" width={40} height={40} />
            <Skeleton variant="circle" width={40} height={40} />
          </div>
          <SkeletonTrackRow count={8} />
        </div>
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <svg className="w-16 h-16 text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Playlist not found</h2>
        <p className="text-sm text-[var(--text-muted)]">{error || "This playlist could not be loaded."}</p>
      </div>
    )
  }

  // Track page view
  useEffect(() => {
    if (!playlist) return
    trackPageView({
      id: playlist.id,
      type: "playlist",
      name: playlist.name,
      imageUrl: getImage(playlist.images),
      subtext: playlist.tracks?.total ? `${playlist.tracks.total} tracks` : undefined,
      href: `/playlist/${playlist.id}`,
    })
  }, [playlist?.id])

  return (
    <div>
      {/* Gradient header */}
      <div
        className="relative px-6 pt-12 pb-8 md:pt-20 md:pb-10"
        style={{
          background: `linear-gradient(135deg, ${generateGradient(id)}, var(--bg-primary))`,
        }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
            {playlist.images?.[0]?.url ? (
              <img src={playlist.images[0].url} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--bg-hover)] flex items-center justify-center">
                <svg className="w-20 h-20 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-center md:text-left min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Playlist</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 leading-tight">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-sm text-zinc-300 max-w-xl line-clamp-2 mb-3">{playlist.description}</p>
            )}
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-zinc-300">
              <span className="font-semibold text-white">{playlist.owner?.display_name}</span>
              {playlist.followers?.total > 0 && (
                <><span className="text-zinc-600">•</span><span>{formatNumber(playlist.followers.total)} likes</span></>
              )}
              {playlist.tracks?.total > 0 && (
                <><span className="text-zinc-600">•</span><span>{formatNumber(playlist.tracks.total)} songs</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      <PlaylistClient tracks={playlist.tracks?.items || []} playlistName={playlist.name || "Imported Playlist"} playlistUri={playlist.uri} playlistId={id} />
    </div>
  )
}

function generateGradient(id: string): string {
  const colors = ["#1db954","#191414","#e13300","#b02897","#ff4632","#b49bc8","#dc148c","#27856a","#8400e7","#a0a0a0","#5179a1","#0d73ec","#bc5900","#e1118b","#1e3264","#608108"]
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
