"use client"

import { useState } from "react"
import { usePlayer } from "@/components/Player"
import TrackList from "@/components/TrackList"
import { useToast } from "@/components/Toast"
import Link from "next/link"
import { getImage, formatArtists } from "@/lib/utils"
import type { PlayerTrack } from "@/components/Player"
import type { SpotifyTrack, SpotifyAlbum, SpotifyArtist } from "@/lib/types"

interface Props {
  topTracks: SpotifyTrack[]
  albums: SpotifyAlbum[]
  relatedArtists: SpotifyArtist[]
  artistName: string
  artistId: string
  bio?: string | null
  nbAlbum?: number
}

const INITIAL_ALBUMS = 12

export default function ArtistClient({ topTracks, albums, relatedArtists, artistName, artistId, bio, nbAlbum }: Props) {
  const { playAll } = usePlayer()
  const { showToast } = useToast()
  const [showAllAlbums, setShowAllAlbums] = useState(false)

  const playerTracks: PlayerTrack[] = topTracks
    .filter((t) => t?.id)
    .map((track) => ({
      id: track.id,
      name: track.name,
      artists: formatArtists(track.artists || []),
      artistIds: (track.artists || []).map((a) => a.id),
      album: track.album?.name || "",
      albumId: track.album?.id || "",
      albumImage: getImage(track.album?.images, "sm"),
      duration: track.duration_ms || 0,
      previewUrl: track.preview_url,
      uri: track.uri,
    }))

  function handlePlayAll() {
    if (playerTracks.length > 0) playAll(playerTracks, 0)
  }

  async function handleShare() {
    const url = `${window.location.origin}/artist/${artistId}`
    try {
      await navigator.clipboard.writeText(url)
      showToast(`Link copied: "${artistName}"`)
    } catch {
      showToast("Failed to copy link", "error")
    }
  }

  const displayedAlbums = showAllAlbums ? albums : albums.slice(0, INITIAL_ALBUMS)
  const hasMoreAlbums = albums.length > INITIAL_ALBUMS

  return (
    <div className="bg-[var(--bg-secondary)]/50 px-3 py-4 space-y-10 pb-20">
      {/* Play all button */}
      <div className="flex items-center gap-4 px-4">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 bg-[var(--accent)] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl hover:opacity-90"
        >
          <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
          title="Copy artist link"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
      </div>

      {/* Artist bio */}
      {bio && (
        <section className="px-4 max-w-3xl">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">About</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {bio}
          </p>
        </section>
      )}

      {/* Top tracks */}
      {topTracks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-[var(--text-primary)] px-4 mb-4">Popular</h2>
          <TrackList
            tracks={topTracks}
            showAlbum={true}
            showImage={true}
            showIndex={true}
            startIndex={0}
          />
        </section>
      )}

      {/* Albums / Discography */}
      {albums.length > 0 && (
        <section>
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Discography
              {nbAlbum && <span className="text-sm font-normal text-[var(--text-muted)] ml-2">{nbAlbum} album{nbAlbum !== 1 ? "s" : ""}</span>}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
            {displayedAlbums.map((album: any) => {
              const year = album.release_date ? new Date(album.release_date).getFullYear() : null
              const typeLabel = album.album_type === "single" ? "Single" : album.album_type === "compilation" ? "Compilation" : "Album"
              return (
                <Link
                  key={album.id}
                  href={`/album/${album.id}`}
                  className="group bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-xl p-4 transition-all border border-[var(--border)] animate-fade-in"
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-[var(--bg-hover)] mb-3 shadow-sm">
                    <img
                      src={getImage(album.images)}
                      alt={album.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{album.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {year ? `${year} • ` : ""}{typeLabel}
                    {album.total_tracks ? ` • ${album.total_tracks} tracks` : ""}
                  </p>
                </Link>
              )
            })}
          </div>

          {/* Show more / Show less toggle */}
          {hasMoreAlbums && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAllAlbums(!showAllAlbums)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-lg transition-all"
              >
                <span>{showAllAlbums ? "Show less" : `Show all ${albums.length} albums`}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showAllAlbums ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Related artists */}
      {relatedArtists.length > 0 && (
        <section>
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Fans also like</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
            {relatedArtists.slice(0, 6).map((artist: any) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="group bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-xl p-4 transition-all text-center border border-[var(--border)]"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden bg-[var(--bg-hover)] mb-3 shadow-sm">
                  <img
                    src={getImage(artist.images)}
                    alt={artist.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{artist.name}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Artist</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {topTracks.length === 0 && albums.length === 0 && relatedArtists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-lg font-medium mb-1">No content available</p>
          <p className="text-sm">We couldn&apos;t find any content for this artist</p>
        </div>
      )}
    </div>
  )
}
