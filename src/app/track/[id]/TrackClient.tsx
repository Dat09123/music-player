"use client"

import { usePlayer } from "@/components/Player"
import { useToast } from "@/components/Toast"
import Link from "next/link"
import { formatDuration, getImage } from "@/lib/utils"
import type { PlayerTrack } from "@/lib/types"

interface Props {
  track: any // Transformed SpotifyTrack-like object
}

export default function TrackClient({ track }: Props) {
  const { playAll, playNext, addToQueue } = usePlayer()
  const { showToast } = useToast()

  const playerTrack: PlayerTrack = {
    id: track.id,
    name: track.name,
    artists: track.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist",
    artistIds: (track.artists || []).map((a: any) => a.id),
    album: track.album?.name || "",
    albumId: track.album?.id || "",
    albumImage: getImage(track.album?.images, "sm"),
    duration: track.duration_ms || 0,
    previewUrl: track.preview_url,
    uri: track.uri,
  }

  function handlePlay() {
    playAll([playerTrack], 0)
  }

  function handlePlayNext() {
    playNext(playerTrack)
    showToast(`"${track.name}" will play next`)
  }

  function handleAddToQueue() {
    addToQueue(playerTrack)
    showToast(`Added "${track.name}" to queue`)
  }

  const artistList = track.artists || []
  const albumImage = getImage(track.album?.images, "lg")

  return (
    <div className="bg-[var(--bg-secondary)]/50 px-3 py-4 pb-20">
      {/* Play controls */}
      <div className="flex items-center gap-4 px-4 py-2 mb-6">
        <button
          onClick={handlePlay}
          className="w-14 h-14 bg-[var(--accent)] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl hover:opacity-90"
        >
          <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button
          onClick={handlePlayNext}
          className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
          title="Play next"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v2h2v12h-2V6z" />
          </svg>
        </button>
        <button
          onClick={handleAddToQueue}
          className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
          title="Add to queue"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Track details */}
      <div className="px-4 space-y-6 max-w-2xl">
        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Artist info */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Artists</p>
            <div className="space-y-2">
              {artistList.length > 0 ? artistList.map((artist: any) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="flex items-center gap-3 group hover:bg-[var(--bg-hover)] rounded-lg p-2 -mx-2 transition-all"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-hover)] flex-shrink-0">
                    {artist.images?.[0]?.url ? (
                      <img src={getImage(artist.images, "sm")} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate transition-colors">
                      {artist.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Artist</p>
                  </div>
                  <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )) : (
                <p className="text-sm text-[var(--text-muted)]">Unknown Artist</p>
              )}
            </div>
          </div>

          {/* Album info */}
          {track.album && (
            <Link
              href={`/album/${track.album.id}`}
              className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4 group hover:bg-[var(--bg-hover)] transition-all"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Album</p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-hover)] flex-shrink-0 shadow-sm">
                  {albumImage && !albumImage.endsWith("/placeholder.svg") ? (
                    <img src={albumImage} alt={track.album.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate transition-colors">
                    {track.album.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {track.album.release_date ? new Date(track.album.release_date).getFullYear() : ""}{" "}
                    {track.album.total_tracks ? `• ${track.album.total_tracks} tracks` : ""}
                  </p>
                </div>
                <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )}
        </div>

        {/* Track metadata */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Details</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Duration</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{formatDuration(track.duration_ms || 0)}</p>
            </div>
            {track.track_number && (
              <div>
                <p className="text-xs text-[var(--text-muted)]">Track Number</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{track.track_number} / {track.album?.total_tracks || "—"}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[var(--text-muted)]">Explicit</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{track.explicit ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
