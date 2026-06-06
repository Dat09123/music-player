"use client"

import type { PlayerTrack } from "./types"

export const LIKED_KEY = "muse-liked-tracks"
export const LIKED_DATA_KEY = "muse-liked-data"

export function getLikedIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]"))
  } catch {
    return new Set()
  }
}

export function saveLikedIds(ids: Set<string>) {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...ids]))
}

export function getLikedTracksData(): PlayerTrack[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(LIKED_DATA_KEY) || "[]")
  } catch {
    return []
  }
}

