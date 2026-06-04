"use client"

import { useState, useEffect } from "react"
import { usePlayer } from "@/components/Player"
import { getRecentlyPlayedArtists, clearRecentlyPlayed, type RecentArtist } from "@/lib/recently-played"
import { getTimeAgo } from "@/lib/utils"
import Link from "next/link"

export default function ArtistHistoryClient() {
  const { currentTrack } = usePlayer()
  const [artists, setArtists] = useState<RecentArtist[]>([])

  useEffect(() => {
    setArtists(getRecentlyPlayedArtists())
  }, [])

  // Refresh when current track changes
  useEffect(() => {
    setArtists(getRecentlyPlayedArtists())
  }, [currentTrack?.id])

  function getInitials(name: string): string {
    return name
      .split(/[\s,/_&-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No artist history</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm">
          Start playing tracks and the artists you listen to will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Artist History</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{artists.length} artist{artists.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { clearRecentlyPlayed(); setArtists([]) }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
          title="Clear all history"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline">Clear All</span>
        </button>
      </div>

      {/* Artist grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {artists.map((artist, i) => {
          const gradientColors = [
            "from-purple-500 to-pink-500",
            "from-blue-500 to-cyan-500",
            "from-emerald-500 to-teal-500",
            "from-orange-500 to-red-500",
            "from-indigo-500 to-violet-500",
            "from-rose-500 to-pink-600",
            "from-amber-500 to-yellow-500",
            "from-green-500 to-emerald-600",
            "from-sky-500 to-blue-600",
            "from-fuchsia-500 to-purple-600",
          ]
          const gradient = gradientColors[i % gradientColors.length]

          return (
            <Link
              key={artist.id}
              href={`/artist/${artist.id}`}
              className="group bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-xl p-4 transition-all text-center border border-[var(--border)] hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="relative mb-3">
                <div className={`w-full aspect-square rounded-full overflow-hidden bg-[var(--bg-hover)] shadow-sm mx-auto`}>
                  {artist.imageUrl && !artist.imageUrl.endsWith("/placeholder.svg") ? (
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <span className="text-2xl font-bold text-white/90 select-none">
                        {getInitials(artist.name)}
                      </span>
                    </div>
                  )}
                </div>
                {/* Play button overlay */}
                <div className="absolute bottom-0.5 right-0.5 w-9 h-9 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-lg translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <p className="font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                {artist.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {artist.trackCount} track{artist.trackCount !== 1 ? "s" : ""}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 opacity-70">
                {getTimeAgo(artist.playedAt)}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
