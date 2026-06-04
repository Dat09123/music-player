"use client"

import { usePlayer } from "@/components/Player"
import TrackList from "@/components/TrackList"
import { formatArtists, getImage } from "@/lib/utils"
import { importTracksAsPlaylist } from "@/lib/playlists"
import type { PlayerTrack } from "@/components/Player"
import type { SpotifyPlaylistTrack } from "@/lib/types"
import { useState } from "react"

interface Props {
  tracks: SpotifyPlaylistTrack[]
  playlistName: string
  playlistUri?: string
}

export default function PlaylistClient({ tracks, playlistName, playlistUri }: Props) {
  const { playAll, isPlaying } = usePlayer()
  const [imported, setImported] = useState(false)

  const playerTracks: PlayerTrack[] = tracks
    .filter((item) => item?.track?.id)
    .map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artists: formatArtists(item.track.artists || []),
      artistIds: (item.track.artists || []).map((a) => a.id),
      album: item.track.album?.name || "",
      albumId: item.track.album?.id || "",
      albumImage: getImage(item.track.album?.images, "sm"),
      duration: item.track.duration_ms || 0,
      previewUrl: item.track.preview_url,
      uri: item.track.uri,
    }))

  function handlePlayAll() {
    if (playerTracks.length > 0) playAll(playerTracks, 0)
  }

  function handleImport() {
    importTracksAsPlaylist(playlistName, playerTracks)
    setImported(true)
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
        <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          onClick={handleImport}
          disabled={imported || playerTracks.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${imported ? "bg-green-500 text-white" : "text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] border border-[var(--border)]"}`}
          title="Save all tracks to your playlists"
        >
          {imported ? (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Saved!</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Save to My Playlists</>
          )}
        </button>
      </div>

      {/* Track list */}
      <TrackList
        tracks={tracks}
        showAlbum={true}
        showImage={true}
        showIndex={true}
        startIndex={0}
      />

      {/* Track count */}
      <div className="px-4 py-6 text-xs text-[var(--text-muted)]">
        {tracks.filter((t) => t?.track?.id).length} songs
      </div>
    </div>
  )
}
