"use client"

import { usePlayer } from "./Player"
import type { PlayerTrack } from "@/lib/types"
import { formatDuration, formatArtists, getImage } from "@/lib/utils"
import type { SpotifyTrack, SpotifyPlaylistTrack } from "@/lib/types"
import { getPlaylists, addTrackToPlaylist, createPlaylist } from "@/lib/playlists"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"

interface TrackListProps {
  tracks: SpotifyTrack[] | SpotifyPlaylistTrack[]
  showAlbum?: boolean
  showImage?: boolean
  showIndex?: boolean
  startIndex?: number
}

export default function TrackList({ tracks, showAlbum = true, showImage = true, showIndex = false, startIndex = 0 }: TrackListProps) {
  const { playAll, currentTrack, isPlaying } = usePlayer()
  const [menuTrack, setMenuTrack] = useState<PlayerTrack | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [playlists, setPlaylists] = useState(getPlaylists())
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)
  const newInputRef = useRef<HTMLInputElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setShowNewPlaylistInput(false)
        setNewPlaylistName("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  useEffect(() => {
    if (showNewPlaylistInput) setTimeout(() => newInputRef.current?.focus(), 50)
  }, [showNewPlaylistInput])

  const validTracks: { track: SpotifyTrack; index: number }[] = tracks
    .map((t, i) => ({
      track: "track" in t ? (t as SpotifyPlaylistTrack).track : (t as SpotifyTrack),
      index: startIndex + i,
    }))
    .filter(({ track }) => track?.id)

  const playerTracks: PlayerTrack[] = validTracks.map(({ track }) => ({
    id: track.id, name: track.name, artists: formatArtists(track.artists || []),
    artistIds: (track.artists || []).map((a) => a.id), album: track.album?.name || "",
    albumId: track.album?.id || "", albumImage: getImage(track.album?.images, "sm"),
    duration: track.duration_ms || 0, previewUrl: track.preview_url, uri: track.uri,
  }))

  function handlePlay(trackIndex: number) {
    if (trackIndex < playerTracks.length) playAll(playerTracks, trackIndex)
  }

  function openMenu(track: PlayerTrack, e: React.MouseEvent) {
    e.stopPropagation()
    setMenuTrack(track)
    setMenuPos({ x: e.clientX, y: e.clientY })
    setPlaylists(getPlaylists())
    setMenuOpen(true)
    setShowNewPlaylistInput(false)
    setNewPlaylistName("")
  }

  function handleAddToPlaylist(playlistId: string) {
    if (!menuTrack) return
    addTrackToPlaylist(playlistId, menuTrack)
    setPlaylists(getPlaylists())
    // Show brief feedback by keeping menu open briefly then close
    setMenuOpen(false)
    setShowNewPlaylistInput(false)
  }

  function handleCreateAndAdd() {
    if (!menuTrack || !newPlaylistName.trim()) return
    const pl = createPlaylist({ name: newPlaylistName.trim() })
    addTrackToPlaylist(pl.id, menuTrack)
    setPlaylists(getPlaylists())
    setMenuOpen(false)
    setShowNewPlaylistInput(false)
    setNewPlaylistName("")
  }

  if (tracks.length === 0) {
    return <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
      <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
      <p className="text-sm">No tracks found</p>
    </div>
  }

  return (
    <div className="space-y-0.5">
      <div className="grid grid-cols-[32px_1fr_64px_28px] gap-3 px-4 py-1.5 text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
        <span className="text-center">#</span>
        <span>Title</span>
        <span className="text-right">
          <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
        <span></span>
      </div>

      {validTracks.map(({ track, index }, i) => {
        const isCurrentTrack = currentTrack?.id === track.id
        const pt = playerTracks[i]
        return (
          <div key={`${track.id}-${i}`} className={`grid grid-cols-[32px_1fr_64px_28px] gap-3 px-4 py-2 rounded-lg group cursor-pointer transition-all hover:bg-gray-50 ${isCurrentTrack ? "text-[var(--accent)] bg-indigo-50/50" : "text-[var(--text-secondary)]"}`} onClick={() => handlePlay(index)}>
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
            <div className="flex items-center justify-end">
              {pt && (
                <button
                  onClick={(e) => openMenu(pt, e)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all p-0.5"
                  title="Add to playlist"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* Add to playlist dropdown menu */}
      {menuOpen && menuTrack && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-[var(--border)] py-1.5 min-w-[200px] max-w-[260px] animate-scale-in"
          style={{ left: Math.min(menuPos.x, window.innerWidth - 280), top: Math.min(menuPos.y, window.innerHeight - 300) }}
        >
          <div className="px-3 py-2 text-xs font-medium text-[var(--text-muted)] border-b border-[var(--border)] truncate">
            Add “{menuTrack.name}” to…
          </div>
          {playlists.length === 0 ? (
            <div className="px-3 py-3 text-xs text-[var(--text-muted)] text-center">No playlists yet</div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAddToPlaylist(pl.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                  <span className="truncate">{pl.name}</span>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">{pl.tracks.length}</span>
                </button>
              ))}
            </div>
          )}
          <div className="border-t border-[var(--border)] pt-1 mt-1">
            {showNewPlaylistInput ? (
              <div className="px-3 py-1.5 flex items-center gap-1.5">
                <input
                  ref={newInputRef}
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateAndAdd(); if (e.key === "Escape") setShowNewPlaylistInput(false) }}
                  placeholder="Playlist name"
                  className="flex-1 px-2 py-1 text-xs border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  maxLength={100}
                />
                <button onClick={handleCreateAndAdd} disabled={!newPlaylistName.trim()} className="text-xs text-white bg-[var(--accent)] px-2 py-1 rounded-lg disabled:opacity-50">Add</button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewPlaylistInput(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Playlist</span>
              </button>
            )}
          </div>
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all border-t border-[var(--border)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Manage Playlists</span>
          </Link>
        </div>
      )}
    </div>
  )
}
