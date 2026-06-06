"use client"

import type { LocalPlaylist, LocalPlaylistCreate, PlayerTrack } from "./types"

const STORAGE_KEY = "muse-playlists"

function loadAll(): LocalPlaylist[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(playlists: LocalPlaylist[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function getPlaylists(): LocalPlaylist[] {
  return loadAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getPlaylist(id: string): LocalPlaylist | null {
  return loadAll().find((p) => p.id === id) ?? null
}

export function createPlaylist(input: LocalPlaylistCreate): LocalPlaylist {
  const playlists = loadAll()
  const now = Date.now()
  const playlist: LocalPlaylist = {
    id: `local-${now}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim() || "New Playlist",
    tracks: [],
    createdAt: now,
    updatedAt: now,
  }
  playlists.push(playlist)
  saveAll(playlists)
  return playlist
}

export function deletePlaylist(id: string): void {
  const playlists = loadAll().filter((p) => p.id !== id)
  saveAll(playlists)
}

export function renamePlaylist(id: string, name: string): void {
  const playlists = loadAll()
  const pl = playlists.find((p) => p.id === id)
  if (pl) {
    pl.name = name.trim() || pl.name
    pl.updatedAt = Date.now()
    saveAll(playlists)
  }
}

export function addTrackToPlaylist(playlistId: string, track: PlayerTrack): void {
  const playlists = loadAll()
  const pl = playlists.find((p) => p.id === playlistId)
  if (!pl) return
  // Avoid duplicates by id
  if (pl.tracks.some((t) => t.id === track.id)) return
  pl.tracks.push(track)
  pl.updatedAt = Date.now()
  saveAll(playlists)
}

export function importTracksAsPlaylist(name: string, tracks: PlayerTrack[]): LocalPlaylist {
  const pl = createPlaylist({ name })
  const playlists = loadAll()
  const saved = playlists.find((p) => p.id === pl.id)!
  saved.tracks = tracks.filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i) // deduplicate
  saved.updatedAt = Date.now()
  saveAll(playlists)
  return saved
}

export function reorderTrack(playlistId: string, fromIndex: number, toIndex: number): void {
  const playlists = loadAll()
  const pl = playlists.find((p) => p.id === playlistId)
  if (!pl || fromIndex === toIndex) return
  if (fromIndex < 0 || fromIndex >= pl.tracks.length || toIndex < 0 || toIndex >= pl.tracks.length) return
  const [moved] = pl.tracks.splice(fromIndex, 1)
  pl.tracks.splice(toIndex, 0, moved)
  pl.updatedAt = Date.now()
  saveAll(playlists)
}

export function removeTrackFromPlaylist(playlistId: string, trackId: string): void {
  const playlists = loadAll()
  const pl = playlists.find((p) => p.id === playlistId)
  if (!pl) return
  pl.tracks = pl.tracks.filter((t) => t.id !== trackId)
  pl.updatedAt = Date.now()
  saveAll(playlists)
}
