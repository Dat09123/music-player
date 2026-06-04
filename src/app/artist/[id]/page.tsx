"use client"

import { useState, useEffect, use } from "react"
import { getImage, formatNumber } from "@/lib/utils"
import { getArtist, getRelatedArtists } from "@/lib/deezer"
import ArtistClient from "./ArtistClient"

interface Props {
  params: Promise<{ id: string }>
}

export default function ArtistPage({ params }: Props) {
  const { id } = use(params)
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
        if (cancelled) return

        const [data, related] = await Promise.all([
          getArtist(id),
          getRelatedArtists(id),
        ])

        if (!cancelled) {
          setArtist(data.artist)
          setTopTracks(data.topTracks)
          setAlbums(data.albums)
          setRelatedArtists(related.artists || [])
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

    loadData()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Hero skeleton */}
        <div className="relative overflow-hidden bg-gradient-to-b from-gray-200/50 to-zinc-900">
          <div className="px-6 pt-20 pb-8 md:pt-28 md:pb-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className="w-48 h-48 md:w-60 md:h-60 rounded-full bg-gray-300 flex-shrink-0 ring-4 ring-white/10" />
              <div className="text-center md:text-left flex-1">
                <div className="h-4 w-16 bg-gray-300 rounded mb-3" />
                <div className="h-12 w-48 bg-gray-300 rounded mb-3" />
                <div className="h-4 w-32 bg-gray-300 rounded" />
              </div>
            </div>
          </div>
        </div>
        {/* Content skeleton */}
        <div className="bg-white/50 px-3 py-4 space-y-10 pb-20">
          {/* Play button */}
          <div className="flex items-center gap-4 px-4">
            <div className="w-14 h-14 rounded-full skeleton" />
          </div>
          {/* Top tracks */}
          <section>
            <div className="h-5 w-20 skeleton rounded px-4 mb-4 ml-4" />
            <div className="space-y-2 px-4">
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
          {/* Albums grid */}
          <section>
            <div className="h-5 w-20 skeleton rounded mb-4 ml-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-[var(--border)]">
                  <div className="w-full aspect-square rounded-lg skeleton mb-3" />
                  <div className="h-3.5 w-24 skeleton rounded mb-1" />
                  <div className="h-3 w-16 skeleton rounded" />
                </div>
              ))}
            </div>
          </section>
        </div>
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
        artistName={artist.name}
      />
    </div>
  )
}
