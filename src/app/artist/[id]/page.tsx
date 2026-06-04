"use client"

import { useState, useEffect, use } from "react"
import { getImage, formatNumber } from "@/lib/utils"
import { getArtist, getRelatedArtists } from "@/lib/deezer"
import ArtistClient from "./ArtistClient"
import Skeleton, { SkeletonHero, SkeletonTrackRow, SkeletonCardGrid } from "@/components/Skeleton"
import { trackPageView } from "@/lib/recently-viewed"
import LazyImage from "@/components/LazyImage"

interface Props {
  params: Promise<{ id: string }>
}

export default function ArtistPage({ params }: Props) {
  const { id } = use(params)
  const [artist, setArtist] = useState<any | null>(null)
  const [topTracks, setTopTracks] = useState<any[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [relatedArtists, setRelatedArtists] = useState<any[]>([])
  const [bio, setBio] = useState<string | null>(null)
  const [nbAlbum, setNbAlbum] = useState<number>(0)
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
          setNbAlbum(data.nbAlbum ?? data.albums.length)
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

  // Track page view after artist loads
  useEffect(() => {
    if (!artist) return
    trackPageView({
      id: artist.id,
      type: "artist",
      name: artist.name,
      imageUrl: getImage(artist.images),
      subtext: artist.followers?.total ? `${formatNumber(artist.followers.total)} followers` : undefined,
      href: `/artist/${artist.id}`,
    })
  }, [artist?.id])

  // Fetch artist bio asynchronously (non-blocking)
  useEffect(() => {
    if (!artist || bio !== null) return
    let cancelled = false

    async function fetchBio() {
      try {
        const wikiRes = await fetch(`/api/wiki?name=${encodeURIComponent(artist.name)}`)
        if (!wikiRes.ok) return
        const wikiData = await wikiRes.json()
        if (!cancelled && wikiData.bio) setBio(wikiData.bio)
      } catch {
        // Bio is optional
      }
    }

    fetchBio()
    return () => { cancelled = true }
  }, [artist, bio])

  if (loading) {
    return (
      <div>
        <SkeletonHero variant="artist" />
        <div className="px-3 py-4 space-y-10 pb-20">
          <div className="flex items-center gap-4 px-4">
            <Skeleton variant="circle" width={56} height={56} />
          </div>
          <section>
            <Skeleton width={80} height={20} className="mb-4 ml-4" />
            <SkeletonTrackRow count={5} />
          </section>
          <section>
            <Skeleton width={80} height={20} className="mb-4 ml-4" />
            <SkeletonCardGrid count={6} />
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
                <LazyImage
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
        artistId={artist.id}
        bio={bio}
        nbAlbum={nbAlbum}
      />
    </div>
  )
}
