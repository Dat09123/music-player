"use client"

import { usePlayer } from "./Player"
import type { PlayerTrack } from "@/lib/types"
import { formatDuration, formatArtists, getImage } from "@/lib/utils"
import type { SpotifyTrack, SpotifyPlaylistTrack } from "@/lib/types"

interface TrackListProps {
  tracks: SpotifyTrack[] | SpotifyPlaylistTrack[]
  showAlbum?: boolean
  showImage?: boolean
  showIndex?: boolean
  startIndex?: number
}

export default function TrackList({ tracks, showAlbum = true, showImage = true, showIndex = false, startIndex = 0 }: TrackListProps) {
  const { playAll, currentTrack, isPlaying } = usePlayer()

  const normalized: { track: SpotifyTrack; index: number }[] = tracks.map((t, i) => ({
    track: "track" in t ? (t as SpotifyPlaylistTrack).track : (t as SpotifyTrack),
    index: startIndex + i,
  }))

  const playerTracks: PlayerTrack[] = normalized.filter(({ track }) => track?.id).map(({ track }) => ({
    id: track.id, name: track.name, artists: formatArtists(track.artists || []),
    artistIds: (track.artists || []).map((a) => a.id), album: track.album?.name || "",
    albumId: track.album?.id || "", albumImage: getImage(track.album?.images, "sm"),
    duration: track.duration_ms || 0, previewUrl: track.preview_url, uri: track.uri,
  }))

  function handlePlay(trackIndex: number) {
    if (trackIndex < playerTracks.length) playAll(playerTracks, trackIndex)
  }

  if (tracks.length === 0) {
    return <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
      <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
      <p className="text-sm">No tracks found</p>
    </div>
  }

  return (
    <div className="space-y-0.5">
      <div className="grid grid-cols-[32px_1fr_64px] gap-3 px-4 py-1.5 text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
        <span className="text-center">#</span>
        <span>Title</span>
        <span className="text-right">
          <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
      </div>

      {normalized.map(({ track, index }, i) => {
        if (!track?.id) return null
        const isCurrentTrack = currentTrack?.id === track.id
        return (
          <div key={`${track.id}-${i}`} className={`grid grid-cols-[32px_1fr_64px] gap-3 px-4 py-2 rounded-lg group cursor-pointer transition-all hover:bg-gray-50 ${isCurrentTrack ? "text-[var(--accent)] bg-indigo-50/50" : "text-[var(--text-secondary)]"}`} onClick={() => handlePlay(index)}>
            <div className="flex items-center justify-center">
              {isCurrentTrack && isPlaying ? (
                <div className="flex items-end gap-[2px] h-3">
                  <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms", height: "60%" }} />
                  <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "100ms", height: "100%" }} />
                  <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "200ms", height: "40%" }} />
                </div>
              ) : (
                <><span className="group-hover:hidden text-xs tabular-nums">{index + 1}</span><svg className="hidden group-hover:block w-3.5 h-3.5 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></>
              )}
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              {showImage && track.album?.images && (
                <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden hidden sm:block">
                  <img src={getImage(track.album.images, "sm")} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="min-w-0">
                <p className={`text-xs font-medium truncate ${isCurrentTrack ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>{track.name}</p>
                <p className="text-xs truncate text-[var(--text-muted)]">{formatArtists(track.artists || [])}{showAlbum && track.album?.name && <span className="hidden md:inline"><span className="mx-1">•</span>{track.album.name}</span>}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              {track.explicit && <span className="text-[9px] bg-gray-200 text-[var(--text-muted)] font-bold px-1 py-0.5 rounded uppercase leading-none">E</span>}
              <span className="text-xs tabular-nums">{formatDuration(track.duration_ms || 0)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
