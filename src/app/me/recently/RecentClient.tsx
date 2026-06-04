"use client"

import { useState, useEffect } from "react"
import { usePlayer } from "@/components/Player"
import { getRecentlyPlayed, clearRecentlyPlayed, type RecentTrack } from "@/lib/recently-played"
import { formatDuration, getTimeAgo } from "@/lib/utils"
import Link from "next/link"

export default function RecentClient() {
  const { playAll, currentTrack, isPlaying } = usePlayer()
  const [tracks, setTracks] = useState<RecentTrack[]>([])

  useEffect(() => {
    setTracks(getRecentlyPlayed())
  }, [])

  // Refresh when current track changes (a new track was played)
  useEffect(() => {
    setTracks(getRecentlyPlayed())
  }, [currentTrack?.id])

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No recently played</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm">
          Start playing tracks and they&apos;ll show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Recently Played</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{tracks.length} track{tracks.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { clearRecentlyPlayed(); setTracks([]) }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
          title="Clear all history"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline">Clear All</span>
        </button>
      </div>

      {/* Track list */}
      <div className="space-y-0.5">
        {tracks.map((track, i) => {
          const isCurrentTrack = currentTrack?.id === track.id
          const timeAgo = getTimeAgo(track.playedAt)

          return (
            <div
              key={`${track.id}-${track.playedAt}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl group cursor-pointer transition-all hover:bg-[var(--bg-hover)] ${isCurrentTrack ? "bg-[var(--accent-light)]" : ""}`}
              onClick={() => playAll(tracks.slice(i).map(t => ({ ...t })), 0)}
            >
              {/* Equalizer / Index */}
              <div className="w-6 flex items-center justify-center flex-shrink-0">
                {isCurrentTrack && isPlaying ? (
                  <div className="flex items-end gap-[2px] h-3">
                    <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms", height: "60%" }} />
                    <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "100ms", height: "100%" }} />
                    <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "200ms", height: "40%" }} />
                  </div>
                ) : (
                  <span className="text-xs tabular-nums text-[var(--text-muted)]">{i + 1}</span>
                )}
              </div>

              {/* Album image */}
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden shadow-sm">
                {track.albumImage ? (
                  <img src={track.albumImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                  </div>
                )}
              </div>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${isCurrentTrack ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>{track.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {track.artistIds?.[0] ? (
                    <Link
                      href={`/artist/${track.artistIds[0]}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-[var(--accent)] hover:underline transition-colors"
                    >
                      {track.artists}
                    </Link>
                  ) : (
                    track.artists
                  )}
                </p>
              </div>

              {/* Time ago */}
              <span className="text-xs text-[var(--text-muted)] flex-shrink-0 hidden sm:block">{timeAgo}</span>

              {/* Duration */}
              <span className="text-xs tabular-nums text-[var(--text-muted)] flex-shrink-0 w-12 text-right">{formatDuration(track.duration)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
