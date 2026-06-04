"use client"

import { usePlayer } from "@/components/Player"
import TrackList from "@/components/TrackList"
import { useToast } from "@/components/Toast"
import { formatArtists, getImage } from "@/lib/utils"
import type { PlayerTrack } from "@/components/Player"
import type { SpotifyAlbum } from "@/lib/types"

interface Props {
  album: SpotifyAlbum
}

export default function AlbumClient({ album }: Props) {
  const { playAll } = usePlayer()
  const { showToast } = useToast()

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

  async function handleShare() {
    const url = `${window.location.origin}/album/${album.id}`
    try {
      await navigator.clipboard.writeText(url)
      showToast(`Link copied: "${album.name}"`)
    } catch {
      showToast("Failed to copy link", "error")
    }
  }

  return (
    <div className="px-3 py-4">
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
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
          title="Copy album link"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
      <div className="mx-4 p-4 rounded-xl bg-[var(--bg-secondary)]/50 backdrop-blur-sm border border-[var(--border)] space-y-1">
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
