"use client"

import type { PlayerTrack } from "./types"

const STORAGE_KEY = "muse-recently-played"
const MAX_ITEMS = 50

export interface RecentTrack extends PlayerTrack {
  playedAt: number
}

function loadAll(): RecentTrack[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(tracks: RecentTrack[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function getRecentlyPlayed(): RecentTrack[] {
  return loadAll()
}

/** Add a track to recently played (deduplicates by id, moves to top) */
export function addToRecentlyPlayed(track: PlayerTrack): void {
  const tracks = loadAll()
  // Remove existing entry with same id
  const filtered = tracks.filter((t) => t.id !== track.id)
  // Add to front
  filtered.unshift({ ...track, playedAt: Date.now() })
  // Trim to max
  saveAll(filtered.slice(0, MAX_ITEMS))
}

/** Clear all recently played history */
export function clearRecentlyPlayed(): void {
  saveAll([])
}

/** Recently played artist entry */
export interface RecentArtist {
  id: string
  name: string
  imageUrl: string
  playedAt: number
  trackCount: number
  lastTrackName: string
  lastTrackId: string
}

/** Get unique recently played artists from track history */
export function getRecentlyPlayedArtists(): RecentArtist[] {
  const tracks = loadAll()
  const artistMap = new Map<string, RecentArtist>()

  for (const track of tracks) {
    const ids = track.artistIds || []
    const names = track.artists.split(", ").map(s => s.trim())

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      const name = names[i] || names[0] || "Unknown"
      if (!id || id === "unknown") continue

      if (artistMap.has(id)) {
        const existing = artistMap.get(id)!
        existing.trackCount++
        // Don't update playedAt/lastTrack — first encounter (most recent) is already correct
      } else {
        artistMap.set(id, {
          id,
          name,
          imageUrl: track.albumImage || "",
          playedAt: track.playedAt,
          trackCount: 1,
          lastTrackName: track.name,
          lastTrackId: track.id,
        })
      }
    }
  }

  // Sort by most recently played
  return Array.from(artistMap.values()).sort((a, b) => b.playedAt - a.playedAt)
}

/** Recently played album entry */
export interface RecentAlbum {
  id: string
  name: string
  imageUrl: string
  artistName: string
  artistIds: string[]
  playedAt: number
  trackCount: number
}

/** Get unique recently played albums from track history */
export function getRecentlyPlayedAlbums(): RecentAlbum[] {
  const tracks = loadAll()
  const albumMap = new Map<string, RecentAlbum>()

  for (const track of tracks) {
    const id = track.albumId
    if (!id || id === "unknown") continue

    if (albumMap.has(id)) {
      const existing = albumMap.get(id)!
      existing.trackCount++
    } else {
      albumMap.set(id, {
        id,
        name: track.album || "Unknown Album",
        imageUrl: track.albumImage || "",
        artistName: track.artists,
        artistIds: track.artistIds,
        playedAt: track.playedAt,
        trackCount: 1,
      })
    }
  }

  return Array.from(albumMap.values()).sort((a, b) => b.playedAt - a.playedAt)
}
