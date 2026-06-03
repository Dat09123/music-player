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
  playlistUri?: string
}

export default function TrackList({ tracks, showAlbum = true, showImage = true, showIndex = false, startIndex = 0, playlistUri }: TrackListProps) {
  const { playTrack, playAll, currentTrack, isPlaying, queue } = usePlayer()

  // Normalize tracks
  const normalized: { track: SpotifyTrack; index: number }[] = tracks.map((t, i) => ({
    track: "track" in t ? (t as SpotifyPlaylistTrack).track : (t as SpotifyTrack),
    index: startIndex + i,
  }))

  const playerTracks: PlayerTrack[] = normalized
    .filter(({ track }) => track?.id)
    .map(({ track, index }) => ({
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

  function handlePlay(trackIndex: number) {
    if (trackIndex < playerTracks.length) {
      playAll(playerTracks, trackIndex)
    }
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p className="text-sm">No tracks found</p>
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {/* Header */}
      <div className="grid grid-cols-[40px_1fr_80px] gap-3 px-4 py-2 text-xs uppercase tracking-wider text-zinc-500 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <span className="text-center">#</span>
        <div className="flex items-center gap-3">
          <span>Title</span>
        </div>
        <span className="text-right">
          <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </div>

      {/* Tracks */}
      {normalized.map(({ track, index }, i) => {
        if (!track?.id) return null
        const isCurrentTrack = currentTrack?.id === track.id
        const msDuration = track.duration_ms || 0
        const artistName = formatArtists(track.artists || [])

        return (
          <div
            key={`${track.id}-${i}`}
            className={`grid grid-cols-[40px_1fr_80px] gap-3 px-4 py-2.5 rounded-lg group cursor-pointer transition-all duration-200 hover:bg-white/5 ${
              isCurrentTrack ? "bg-green-500/10 text-green-400" : "text-zinc-400"
            }`}
            onClick={() => handlePlay(index)}
            onDoubleClick={() => handlePlay(index)}
          >
            {/* Index / Play button */}
            <div className="flex items-center justify-center">
              {isCurrentTrack && isPlaying ? (
                <div className="flex items-end gap-[2px] h-4">
                  <span className="w-[3px] bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms", height: "60%" }} />
                  <span className="w-[3px] bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "100ms", height: "100%" }} />
                  <span className="w-[3px] bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "200ms", height: "40%" }} />
                </div>
              ) : (
                <>
                  <span className="group-hover:hidden text-sm tabular-nums">{index + 1}</span>
                  <svg className="hidden group-hover:block w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </>
              )}
            </div>

            {/* Track info */}
            <div className="flex items-center gap-3 min-w-0">
              {showImage && track.album?.images && (
                <div className="w-10 h-10 rounded bg-zinc-800 flex-shrink-0 overflow-hidden hidden sm:block">
                  <img
                    src={getImage(track.album.images, "sm")}
                    alt={track.album.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${isCurrentTrack ? "text-green-400" : "text-white group-hover:text-white"}`}>
                  {track.name}
                </p>
                <p className="text-xs truncate text-zinc-500 group-hover:text-zinc-400 transition-colors">
                  {artistName}
                  {showAlbum && track.album?.name && (
                    <span className="hidden md:inline">
                      <span className="mx-1.5">•</span>
                      {track.album.name}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-end gap-2">
              {track.explicit && (
                <span className="text-[10px] bg-zinc-700 text-zinc-400 font-bold px-1.5 py-0.5 rounded uppercase leading-none">E</span>
              )}
              <span className="text-sm tabular-nums">{formatDuration(msDuration)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
