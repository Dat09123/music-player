"use client"

import { useState, useEffect } from "react"
import { getImage, formatNumber, getTimeAgo } from "@/lib/utils"
import { getChart } from "@/lib/deezer"
import Card from "@/components/Card"
import Link from "next/link"
import Skeleton from "@/components/Skeleton"
import LazyImage from "@/components/LazyImage"
import { usePlayer } from "@/components/Player"
import { getRecentlyPlayed } from "@/lib/recently-played"
import { getRecentlyViewed } from "@/lib/recently-viewed"
import type { PlayerTrack } from "@/lib/types"
import type { RecentlyViewedItem } from "@/lib/recently-viewed"
import { SearchIcon, ContinueListeningIcon, MusicNoteIcon, PlayIcon, ClockIcon, PersonIcon, WarningIcon, EmptyMusicIcon } from "@/components/Icons"

export default function HomePage() {
  const { playTrack } = usePlayer()
  const [playlists, setPlaylists] = useState<any[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [recentTracks, setRecentTracks] = useState<any[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setRecentlyViewed(getRecentlyViewed())
    setRecentTracks(getRecentlyPlayed())

    async function loadData() {
      try {
        const chart = await getChart()
        if (!cancelled) {
          setPlaylists(chart.playlists)
          setAlbums(chart.albums)
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not load data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [])

  // Refresh recently played when the page gains focus
  useEffect(() => {
    function refresh() {
      setRecentTracks(getRecentlyPlayed())
      setRecentlyViewed(getRecentlyViewed())
    }
    window.addEventListener("focus", refresh)
    return () => window.removeEventListener("focus", refresh)
  }, [])

  const lastPlayed = recentTracks.length > 0 ? recentTracks[0] : null

  if (loading) {
    return (
      <div className="p-5 space-y-8 max-w-7xl mx-auto">
        <Skeleton variant="card" className="!p-6 md:!p-8" />
        <div>
          <Skeleton width={160} height={20} className="mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton variant="card" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
          <WarningIcon className="w-8 h-8 text-red-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Could not load data</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-8 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-900/30 p-6 md:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">Discover Music</h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-lg">Explore popular playlists, albums, and more from Deezer.</p>
          <div className="flex gap-2 mt-4">
            <Link href="/search" className="inline-flex items-center gap-1.5 bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-all">
              <SearchIcon className="w-3.5 h-3.5" />
              Search Music
            </Link>
          </div>
        </div>
      </section>

      {/* Continue Listening — Last played track */}
      {lastPlayed && (
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            <span className="flex items-center gap-2">
              <ContinueListeningIcon className="w-5 h-5 text-[var(--accent)]" />
              Continue Listening
            </span>
          </h2>
          <div className="glass rounded-xl border border-[var(--border)] p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--bg-hover)] flex-shrink-0 shadow-sm">
                {lastPlayed.albumImage ? (
                  <LazyImage src={lastPlayed.albumImage} alt={lastPlayed.album} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                    <MusicNoteIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{lastPlayed.name}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">{lastPlayed.artists} • {lastPlayed.album}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{getTimeAgo(lastPlayed.playedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => playTrack(lastPlayed as PlayerTrack)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all shadow-sm whitespace-nowrap"
              >
                <PlayIcon className="w-4 h-4" />
                Play Again
              </button>
              <Link
                href={`/track/${lastPlayed.id}`}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all whitespace-nowrap"
              >
                View Track
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recently Played Tracks */}
      {recentTracks.length > 1 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Recently Played</h2>
            <Link href="/me/recently" className="text-xs font-medium text-[var(--accent)] hover:underline">See all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-5 px-5">
            {recentTracks.slice(1, 8).map((track) => (
              <Link
                key={`${track.id}-${track.playedAt}`}
                href={`/track/${track.id}`}
                className="flex-shrink-0 w-36 sm:w-40 group bg-[var(--bg-secondary)]/50 backdrop-blur-sm rounded-xl border border-[var(--border)] p-3 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--accent)]/20 snap-start"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-[var(--bg-hover)] mb-2 shadow-sm">
                  {track.albumImage ? (
                    <LazyImage src={track.albumImage} alt={track.album} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      <MusicNoteIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{track.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{track.artists}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Pages */}
      {recentlyViewed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              <span className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-[var(--text-muted)]" />
                Recently Viewed
              </span>
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-5 px-5">
            {recentlyViewed.slice(0, 10).map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="flex-shrink-0 w-36 sm:w-40 group bg-[var(--bg-secondary)]/50 backdrop-blur-sm rounded-xl border border-[var(--border)] p-3 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--accent)]/20 snap-start"
              >
                <div className={`w-full aspect-square overflow-hidden bg-[var(--bg-hover)] mb-2 shadow-sm ${item.type === "artist" ? "rounded-full" : "rounded-lg"}`}>
                  {item.imageUrl && !item.imageUrl.endsWith("/placeholder.svg") ? (
                    <LazyImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      {item.type === "artist" ? (
                        <PersonIcon className="w-8 h-8" />
                      ) : (
                        <MusicNoteIcon className="w-8 h-8" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{item.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5 capitalize">{item.type}{item.subtext ? ` • ${item.subtext}` : ""}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Playlists */}
      {playlists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Popular Playlists</h2>
            <Link href="/search" className="text-xs font-medium text-[var(--accent)] hover:underline">Show all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {playlists.slice(0, 12).map((pl: any, i: number) => (
              <div key={pl.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 12)}`}>
                <Card id={pl.id} name={pl.name} description={pl.description} imageUrl={getImage(pl.images)} type="playlist" href={`/playlist/${pl.id}`} subtext={pl.tracks?.total ? `${formatNumber(pl.tracks.total)} tracks` : undefined} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular Albums */}
      {albums.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Popular Albums</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {albums.slice(0, 12).map((album: any, i: number) => (
              <div key={album.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 12)}`}>
                <Card id={album.id} name={album.name} imageUrl={getImage(album.images)} type="album" href={`/album/${album.id}`} subtext={`${new Date(album.release_date).getFullYear()} • ${album.artists?.map((a: any) => a.name).join(", ")}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {playlists.length === 0 && albums.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
          <EmptyMusicIcon className="w-12 h-12 mb-3 opacity-40" strokeWidth={1} />
          <p className="text-sm font-medium">No data available</p>
          <p className="text-xs mt-1">Try refreshing the page</p>
        </div>
      )}
    </div>
  )
}
