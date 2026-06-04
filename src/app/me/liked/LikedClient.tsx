"use client"

import { useState, useEffect } from "react"
import { usePlayer } from "@/components/Player"
import Link from "next/link"
import LazyImage from "@/components/LazyImage"
import { formatDuration } from "@/lib/utils"
import type { PlayerTrack } from "@/lib/types"

const LIKED_KEY = "muse-liked-tracks"
const LIKED_DATA_KEY = "muse-liked-data"

function getLikedIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]")) } catch { return new Set() }
}

function getLikedTracks(): PlayerTrack[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(LIKED_DATA_KEY) || "[]") } catch { return [] }
}

export default function LikedClient() {
  const { playAll, currentTrack, isPlaying, toggleLike, likedTracks } = usePlayer()
  const [tracks, setTracks] = useState<PlayerTrack[]>([])

  useEffect(() => {
    const ids = getLikedIds()
    const data = getLikedTracks()
    setTracks(data.filter(t => ids.has(t.id)))
  }, [likedTracks])

  function handlePlay(index: number) {
    if (tracks.length > 0) playAll(tracks, index)
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-b from-red-100 via-pink-50 to-[var(--bg-primary)] dark:from-red-950/30 dark:via-pink-950/20 dark:to-[var(--bg-primary)] px-6 pt-12 pb-8 md:pt-20 md:pb-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-br from-red-400 via-pink-400 to-purple-400 flex items-center justify-center">
            <svg className="w-24 h-24 text-white/90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Playlist</p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-3">Liked Songs</h1>
            <p className="text-sm text-[var(--text-secondary)]">{tracks.length} songs</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-4">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)]">
            <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-lg font-medium text-[var(--text-primary)] mb-1">No liked songs yet</p>
            <p className="text-sm">Hit the ♥ button on the player to save songs here</p>
          </div>
        ) : (
          <>
            {/* Play button */}
            <div className="flex items-center gap-4 px-4 py-2 mb-4">
              <button
                onClick={() => handlePlay(0)}
                className="w-14 h-14 bg-[var(--accent)] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
            </div>

            {/* Track list */}
            <div className="space-y-0.5">
              {tracks.map((track, i) => {
                const isCurrent = currentTrack?.id === track.id
                return (
                  <div
                    key={track.id}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl group cursor-pointer transition-all hover:bg-[var(--bg-hover)]/70 ${isCurrent ? "bg-[var(--accent)]/8 text-[var(--accent)]" : ""}`}
                    onClick={() => handlePlay(i)}
                  >
                    <span className="w-6 text-center text-xs tabular-nums text-[var(--text-muted)] flex-shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end gap-[2px] h-3 mx-auto w-fit">
                          <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ height: "60%", animationDelay: "0ms" }} />
                          <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ height: "100%", animationDelay: "100ms" }} />
                          <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ height: "40%", animationDelay: "200ms" }} />
                        </div>
                      ) : i + 1}
                    </span>
                    <div className="w-8 h-8 rounded bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden">
                      {track.albumImage ? (
                        <LazyImage src={track.albumImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${isCurrent ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>{track.name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{track.artists}</p>
                    </div>
                    <span className="text-xs tabular-nums text-[var(--text-muted)]">{formatDuration(track.duration)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(track.id) }}
                      className="text-red-500 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                      title="Unlike"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
