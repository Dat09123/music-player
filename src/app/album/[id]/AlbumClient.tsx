"use client"

import { usePlayer } from "@/components/Player"
import TrackList from "@/components/TrackList"
import { formatArtists, getImage } from "@/lib/utils"
import type { PlayerTrack } from "@/components/Player"
import type { SpotifyAlbum } from "@/lib/types"

interface Props {
  album: SpotifyAlbum
}

export default function AlbumClient({ album }: Props) {
  const { playAll } = usePlayer()

  const tracks = (album.tracks?.items || []).map((track: any) => ({
    ...track,
    album: album,
  }))

  const playerTracks: PlayerTrack[] = tracks
    .filter((track: any) => track?.id)
    .map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: formatArtists(track.artists || []),
      artistIds: (track.artists || []).map((a: any) => a.id),
      album: album.name,
      albumId: album.id,
      albumImage: getImage(album.images, "sm"),
      duration: track.duration_ms || 0,
      previewUrl: track.preview_url,
      uri: track.uri,
    }))

  function handlePlayAll() {
    if (playerTracks.length > 0) playAll(playerTracks, 0)
  }

  return (
    <div className="bg-[var(--bg-secondary)]/50 px-3 py-4">
      {/* Play controls */}
      <div className="flex items-center gap-4 px-4 py-2 mb-4">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 bg-[var(--accent)] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl hover:opacity-90"
        >
          <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Track list */}
      <TrackList
        tracks={tracks}
        showAlbum={false}
        showImage={false}
        showIndex={true}
        startIndex={0}
      />

      {/* Album info footer */}
      <div className="px-4 py-6 space-y-2">
        <p className="text-xs text-[var(--text-muted)]">
          {album.total_tracks} songs
        </p>
        {album.label && (
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date(album.release_date).getFullYear()} {album.label}
          </p>
        )}
      </div>
    </div>
  )
}
