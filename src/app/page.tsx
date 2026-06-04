"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import { spotifyFetch } from "@/lib/api-client"
import { getImage, formatNumber } from "@/lib/utils"
import Card from "@/components/Card"
import SpotifyLoginButton from "@/components/SpotifyLoginButton"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading, getToken } = useAuth()
  const [featuredPlaylists, setFeaturedPlaylists] = useState<any[]>([])
  const [newReleases, setNewReleases] = useState<any[]>([])
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

        const [featuredData, newReleasesData] = await Promise.all([
          spotifyFetch("browse/featured-playlists", token).catch(() => ({ playlists: { items: [] } })),
          spotifyFetch("browse/new-releases", token).catch(() => ({ albums: { items: [] } })),
        ])

        if (!cancelled) {
          setFeaturedPlaylists(featuredData.playlists?.items || [])
          setNewReleases(newReleasesData.albums?.items || [])
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.message || "Could not load data"
          if (msg === "AUTH_REQUIRED") {
            setError("Please log in to view music data")
          } else {
            setError(msg)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (!authLoading) {
      loadData()
    }

    return () => { cancelled = true }
  }, [authLoading, getToken])

  // Show loading skeleton while checking auth
  if (authLoading || loading) {
    return (
      <div className="p-5 space-y-8 max-w-7xl mx-auto pb-20">
        <div className="rounded-xl bg-gray-50 border border-[var(--border)] p-6 md:p-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
        </div>
        <div>
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-lg mb-2" />
                <div className="h-4 w-24 bg-gray-100 rounded mb-1" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Log in to discover music</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
          Sign in with your Spotify account to explore featured playlists, new releases, and more.
        </p>
        <SpotifyLoginButton />
      </div>
    )
  }

  // Show error state
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
        <SpotifyLoginButton />
      </div>
    )
  }

  return (
    <div className="p-5 space-y-8 pb-28 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 p-6 md:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">Discover Music</h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-lg">Explore featured playlists and new releases.</p>
          <div className="flex gap-2 mt-4">
            <Link href="/search" className="inline-flex items-center gap-1.5 bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Search Music
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Playlists */}
      {featuredPlaylists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Featured Playlists</h2>
            <Link href="/search" className="text-xs font-medium text-[var(--accent)] hover:underline">Show all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {featuredPlaylists.slice(0, 12).map((playlist: any) => (
              <Card key={playlist.id} id={playlist.id} name={playlist.name} description={playlist.description} imageUrl={getImage(playlist.images)} type="playlist" href={`/playlist/${playlist.id}`} subtext={playlist.tracks?.total ? `${formatNumber(playlist.tracks.total)} tracks` : undefined} />
            ))}
          </div>
        </section>
      )}

      {/* New Releases */}
      {newReleases.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">New Releases</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {newReleases.slice(0, 12).map((album: any) => (
              <Card key={album.id} id={album.id} name={album.name} imageUrl={getImage(album.images)} type="album" href={`/album/${album.id}`} subtext={`${new Date(album.release_date).getFullYear()} • ${album.artists?.map((a: any) => a.name).join(", ")}`} />
            ))}
          </div>
        </section>
      )}

      {featuredPlaylists.length === 0 && newReleases.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
          <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
          <p className="text-sm font-medium">No data available</p>
          <p className="text-xs mt-1">Try logging in and refreshing the page</p>
        </div>
      )}
    </div>
  )
}
