"use client"

import dynamic from "next/dynamic"
import { usePlayer } from "@/components/Player"
import { toPlayerTrack } from "@/lib/utils"
import { importTracksAsPlaylist } from "@/lib/playlists"
import { useToast } from "@/components/Toast"
import type { SpotifyPlaylistTrack } from "@/lib/types"
import { useState } from "react"
import { TrackListSkeleton } from "@/components/Skeleton"

const TrackList = dynamic(() => import("@/components/TrackList"), {
  loading: () => <TrackListSkeleton />
})

interface Props {
  tracks: SpotifyPlaylistTrack[]
  playlistName: string
  playlistUri?: string
  playlistId?: string
}

export default function PlaylistClient({ tracks, playlistName, playlistUri, playlistId }: Props) {
  const { playAll } = usePlayer()
  const { showToast } = useToast()
  const [imported, setImported] = useState(false)

  const playerTracks = tracks
    .filter((t) => t?.track?.id)
    .map((t) => toPlayerTrack(t.track))
    .filter((t) => t.previewUrl)

  const playableCount = playerTracks.length
  const totalCount = tracks.filter((t) => t?.track?.id).length

  function handlePlayAll() {
    if (playerTracks.length === 0) {
      showToast("No playable tracks in this playlist", "error")
      return
    }
    playAll(playerTracks, 0)
    if (playableCount < totalCount) {
      showToast(`Playing ${playableCount}/${totalCount} tracks (${totalCount - playableCount} unavailable)`)
    }
  }

  function handleImport() {
    importTracksAsPlaylist(playlistName, playerTracks)
    setImported(true)
    showToast(`Imported "${playlistName}" (${playerTracks.length} tracks) to your library`)
  }

  async function handleShare() {
    const url = `${window.location.origin}/playlist/${playlistId || playlistUri?.split(":").pop() || ""}`
    try {
      await navigator.clipboard.writeText(url)
      showToast(`Link copied: "${playlistName}"`)
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
          title="Copy playlist link"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <button
          onClick={handleImport}
          disabled={imported || playerTracks.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${imported ? "bg-green-500/90 text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 border border-[var(--border)]"}`}
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
      <div className="mx-4 p-4 rounded-xl bg-[var(--bg-secondary)]/50 backdrop-blur-sm border border-[var(--border)] text-xs text-[var(--text-muted)]">
        {playableCount}/{totalCount} songs available
      </div>
    </div>
  )
}
