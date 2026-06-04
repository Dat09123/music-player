"use client"

import { useState, useEffect } from "react"
import { getImage, formatNumber } from "@/lib/utils"
import { getChart } from "@/lib/deezer"
import Card from "@/components/Card"
import Link from "next/link"

export default function HomePage() {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

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

  if (loading) {
    return (
      <div className="p-5 space-y-8 max-w-7xl mx-auto">
        <div className="rounded-xl border border-[var(--border)] p-6 md:p-8">
          <div className="h-8 w-48 skeleton rounded mb-2" />
          <div className="h-4 w-72 skeleton rounded" />
        </div>
        <div>
          <div className="h-5 w-40 skeleton rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-square skeleton rounded-lg mb-2" />
                <div className="h-4 w-24 skeleton rounded mb-1" />
                <div className="h-3 w-16 skeleton rounded" />
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
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
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
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Search Music
            </Link>
          </div>
        </div>
      </section>

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
          <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
          <p className="text-sm font-medium">No data available</p>
          <p className="text-xs mt-1">Try refreshing the page</p>
        </div>
      )}
    </div>
  )
}
