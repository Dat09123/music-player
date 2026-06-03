"use client"

import { useState, useEffect, use } from "react"
import { useAuth } from "@/lib/AuthContext"
import { spotifyFetch } from "@/lib/api-client"
import { getImage, formatNumber } from "@/lib/utils"
import ArtistClient from "./ArtistClient"

interface Props {
  params: Promise<{ id: string }>
}

export default function ArtistPage({ params }: Props) {
  const { id } = use(params)
  const { isAuthenticated, isLoading: authLoading, getToken } = useAuth()
  const [artist, setArtist] = useState<any | null>(null)
  const [topTracks, setTopTracks] = useState<any[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [relatedArtists, setRelatedArtists] = useState<any[]>([])
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

        const [artistData, topTracksData, albumsData, relatedData] = await Promise.all([
          spotifyFetch(`artists/${id}`, token),
          spotifyFetch(`artists/${id}/top-tracks`, token),
          spotifyFetch(`artists/${id}/albums?include_groups=album,single&limit=10`, token),
          spotifyFetch(`artists/${id}/related-artists`, token),
        ])

        if (!cancelled) {
          setArtist(artistData)
          setTopTracks(topTracksData.tracks || [])
          setAlbums(albumsData.items || [])
          setRelatedArtists(relatedData.artists || [])
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Could not load artist")
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
      <div className="animate-pulse px-6 pt-20 pb-8 md:pt-28 md:pb-12">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="w-48 h-48 md:w-60 md:h-60 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="text-center md:text-left flex-1">
            <div className="h-4 w-16 bg-gray-200 rounded mb-3" />
            <div className="h-12 w-48 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Log in to view artist details</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Sign in with Spotify to see top tracks, albums, and more.</p>
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <svg className="w-16 h-16 text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Artist not found</h2>
        <p className="text-sm text-[var(--text-muted)]">{error || "This artist could not be loaded."}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/80 to-zinc-900 z-10" />
        {artist.images?.[0]?.url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${artist.images[0].url})`, filter: "blur(60px)", opacity: 0.4, transform: "scale(1.2)" }}
          />
        )}

        <div className="relative z-20 px-6 pt-20 pb-8 md:pt-28 md:pb-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/10 flex-shrink-0">
              {artist.images?.[0]?.url ? (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                  <svg className="w-24 h-24 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="text-center md:text-left min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">Artist</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-3 leading-tight">
                {artist.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap text-sm">
                {artist.followers?.total > 0 && (
                  <span className="text-zinc-300">
                    <span className="font-bold text-white">{formatNumber(artist.followers.total)}</span> followers
                  </span>
                )}
                {artist.genres?.length > 0 && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <div className="flex gap-1.5 flex-wrap justify-center md:justify-start">
                      {artist.genres.slice(0, 3).map((genre: string) => (
                        <span key={genre} className="text-xs bg-white/10 text-zinc-300 px-3 py-1 rounded-full capitalize">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ArtistClient
        topTracks={topTracks}
        albums={albums}
        relatedArtists={relatedArtists}
        artistId={artist.id}
        artistName={artist.name}
      />
    </div>
  )
}
