"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { HomeIcon, SearchIcon, MusicNoteIcon } from "@/components/Icons"
import { getRecentlyViewed } from "@/lib/recently-viewed"
import { getRecentlyPlayed } from "@/lib/recently-played"
import type { RecentlyViewedItem } from "@/lib/recently-viewed"
import type { RecentTrack } from "@/lib/recently-played"

export default function OfflinePage() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([])
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([])

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed().slice(0, 8))
    setRecentTracks(getRecentlyPlayed().slice(0, 5))
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-16 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">You&apos;re offline</h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
        Check your internet connection and try again. Here are some things you can still access:
      </p>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        <Link
          href="/"
          className="flex items-center gap-2 bg-[var(--bg-hover)] hover:bg-[var(--accent)]/10 text-[var(--text-primary)] px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-[var(--border)]"
        >
          <HomeIcon className="w-4 h-4" />
          Home
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-2 bg-[var(--bg-hover)] hover:bg-[var(--accent)]/10 text-[var(--text-primary)] px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-[var(--border)]"
        >
          <SearchIcon className="w-4 h-4" />
          Search
        </Link>
        <Link
          href="/me/liked"
          className="flex items-center gap-2 bg-[var(--bg-hover)] hover:bg-[var(--accent)]/10 text-[var(--text-primary)] px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-[var(--border)]"
        >
          <MusicNoteIcon className="w-4 h-4" />
          Liked Songs
        </Link>
      </div>

      {/* Recently played */}
      {recentTracks.length > 0 && (
        <section className="w-full max-w-md text-left mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Recently Played
          </h2>
          <div className="space-y-2">
            {recentTracks.map((track) => (
              <Link
                key={`${track.id}-${track.playedAt}`}
                href={`/track/${track.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--bg-hover)] transition-all group"
              >
                <div className="w-8 h-8 rounded bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden">
                  {track.albumImage ? (
                    <img src={track.albumImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      <MusicNoteIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{track.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">{track.artists}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <section className="w-full max-w-md text-left">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Recently Viewed
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {recentlyViewed.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="flex-shrink-0 w-28 group"
              >
                <div className={`w-28 h-28 overflow-hidden bg-[var(--bg-hover)] mb-2 shadow-sm ${item.type === "artist" ? "rounded-full" : "rounded-lg"}`}>
                  {item.imageUrl && !item.imageUrl.endsWith("/placeholder.svg") ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      <MusicNoteIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-medium text-[var(--text-primary)] truncate text-center">{item.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {recentTracks.length === 0 && recentlyViewed.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">
          Once you browse some music, you&apos;ll be able to access it here even offline.
        </p>
      )}
    </div>
  )
}
