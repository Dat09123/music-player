"use client"

import { usePlayer } from "@/components/Player"
import TrackList from "@/components/TrackList"
import Link from "next/link"
import { getImage, formatArtists } from "@/lib/utils"
import type { PlayerTrack } from "@/components/Player"
import type { SpotifyTrack, SpotifyAlbum, SpotifyArtist } from "@/lib/types"

interface Props {
  topTracks: SpotifyTrack[]
  albums: SpotifyAlbum[]
  relatedArtists: SpotifyArtist[]
  artistId: string
  artistName: string
}

export default function ArtistClient({ topTracks, albums, relatedArtists, artistName }: Props) {
  const { playAll } = usePlayer()

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

  return (
    <div className="bg-zinc-900/50 px-3 py-4 space-y-10 pb-28">
      {/* Play all button */}
      <div className="flex items-center gap-4 px-4">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl hover:bg-green-400"
        >
          <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Top tracks */}
      {topTracks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white px-4 mb-4">Popular</h2>
          <TrackList
            tracks={topTracks}
            showAlbum={true}
            showImage={true}
            showIndex={true}
            startIndex={0}
          />
        </section>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <section>
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-xl font-bold text-white">Albums</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
            {albums.slice(0, 6).map((album: any) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="group bg-zinc-900/40 hover:bg-zinc-800/60 rounded-xl p-4 transition-all"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-3 shadow-lg">
                  <img
                    src={getImage(album.images)}
                    alt={album.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="font-semibold text-sm text-white truncate">{album.name}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {new Date(album.release_date).getFullYear()} • {album.album_type === "single" ? "Single" : album.album_type === "compilation" ? "Compilation" : "Album"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related artists */}
      {relatedArtists.length > 0 && (
        <section>
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-xl font-bold text-white">Fans also like</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
            {relatedArtists.slice(0, 6).map((artist: any) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="group bg-zinc-900/40 hover:bg-zinc-800/60 rounded-xl p-4 transition-all text-center"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden bg-zinc-800 mb-3 shadow-lg">
                  <img
                    src={getImage(artist.images)}
                    alt={artist.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="font-semibold text-sm text-white truncate">{artist.name}</p>
                <p className="text-xs text-zinc-400 mt-1">Artist</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {topTracks.length === 0 && albums.length === 0 && relatedArtists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
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
