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
  } catch (e) {
    console.error("[RecentlyPlayed] Failed to save:", e)
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
