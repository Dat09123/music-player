"use client"

import { usePlayer } from "./Player"
import type { PlayerTrack } from "@/lib/types"
import { formatDuration, formatArtists, getImage } from "@/lib/utils"
import type { SpotifyTrack, SpotifyPlaylistTrack } from "@/lib/types"
import { getPlaylists, addTrackToPlaylist, createPlaylist } from "@/lib/playlists"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useToast } from "./Toast"
import LazyImage from "./LazyImage"
import { PlayIcon, ClockIcon, PlusIcon, LinkIcon, MusicNoteStrokeIcon, PersonIcon, SettingsIcon, EmptyMusicIcon } from "@/components/Icons"

interface TrackListProps {
  tracks: SpotifyTrack[] | SpotifyPlaylistTrack[]
  showAlbum?: boolean
  showImage?: boolean
  showIndex?: boolean
  startIndex?: number
}

export default function TrackList({ tracks, showAlbum = true, showImage = true, showIndex = false, startIndex = 0 }: TrackListProps) {
  const { playAll, playNext, addToQueue, currentTrack, isPlaying } = usePlayer()
  const { showToast } = useToast()
  const [menuTrack, setMenuTrack] = useState<PlayerTrack | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0, adjustedX: 0, adjustedY: 0 })
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
    const x = Math.min(e.clientX, window.innerWidth - 280)
    const y = Math.min(e.clientY, window.innerHeight - 300)
    setMenuPos({ x: e.clientX, y: e.clientY, adjustedX: x, adjustedY: y })
    setPlaylists(getPlaylists())
    setMenuOpen(true)
    setShowNewPlaylistInput(false)
    setNewPlaylistName("")
  }

  function handleAddToPlaylist(playlistId: string, playlistName?: string) {
    if (!menuTrack) return
    addTrackToPlaylist(playlistId, menuTrack)
    setPlaylists(getPlaylists())
    setMenuOpen(false)
    setShowNewPlaylistInput(false)
    showToast(`Added "${menuTrack.name}" to ${playlistName || "playlist"}`)
  }

  function handleCreateAndAdd() {
    if (!menuTrack || !newPlaylistName.trim()) return
    const pl = createPlaylist({ name: newPlaylistName.trim() })
    addTrackToPlaylist(pl.id, menuTrack)
    setPlaylists(getPlaylists())
    setMenuOpen(false)
    setShowNewPlaylistInput(false)
    setNewPlaylistName("")
    showToast(`Created "${pl.name}" and added "${menuTrack.name}"`)
  }

  function formatArtistLinks(artists: { id: string; name: string }[]) {
    return artists.map((artist, i) => (
      <span key={artist.id}>
        <Link
          href={`/artist/${artist.id}`}
          onClick={(e) => e.stopPropagation()}
          className="hover:text-[var(--accent)] hover:underline transition-colors"
        >
          {artist.name}
        </Link>
        {i < artists.length - 1 && <span className="mx-0.5">, </span>}
      </span>
    ))
  }

  if (tracks.length === 0) {
    return <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
      <EmptyMusicIcon className="w-12 h-12 mb-3 opacity-50" strokeWidth={1} />
      <p className="text-sm">No tracks found</p>
    </div>
  }

  return (
    <div className="space-y-0.5">
      <div className="grid grid-cols-[32px_1fr_64px_28px] gap-3 px-4 py-1.5 text-[11px] text-[var(--text-muted)] font-medium border-b border-[var(--border)]/50">
        <span className="text-center">#</span>
        <span>Title</span>
        <span className="text-right">
          <ClockIcon className="w-3.5 h-3.5 inline" />
        </span>
        <span></span>
      </div>

      {validTracks.map(({ track, index }, i) => {
        const isCurrentTrack = currentTrack?.id === track.id
        const pt = playerTracks[i]
        return (
          <div key={`${track.id}-${i}`} className={`grid grid-cols-[32px_1fr_64px_28px] gap-3 px-4 py-2 rounded-xl group cursor-pointer transition-all hover:bg-[var(--bg-hover)]/70 ${isCurrentTrack ? "text-[var(--accent)] bg-[var(--accent)]/8" : "text-[var(--text-secondary)]"}`} onClick={() => handlePlay(index)}>
            <div className="flex items-center justify-center">
              {isCurrentTrack && isPlaying ? (
                <div className="flex items-end gap-[2px] h-3">
                  <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms", height: "60%" }} />
                  <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "100ms", height: "100%" }} />
                  <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "200ms", height: "40%" }} />
                </div>
              ) : (
                <>              <span className="group-hover:hidden text-xs tabular-nums text-[var(--text-muted)]">{index + 1}</span><PlayIcon className="hidden group-hover:block w-3.5 h-3.5 text-[var(--accent)]" /></>
              )}
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              {showImage && track.album?.images && (
                <div className="w-8 h-8 rounded bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden hidden sm:block">
                  <LazyImage src={getImage(track.album.images, "sm")} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <p className={`text-xs font-medium truncate ${isCurrentTrack ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>{track.name}</p>
                <p className="text-xs truncate text-[var(--text-muted)]">
                  {formatArtistLinks(track.artists || [])}
                  {showAlbum && track.album?.name && <span className="hidden md:inline"><span className="mx-0.5">•</span><Link href={`/album/${track.album.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-[var(--accent)] hover:underline transition-colors">{track.album.name}</Link></span>}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              {track.explicit && <span className="text-[9px] bg-[var(--bg-hover)] text-[var(--text-muted)] font-bold px-1 py-0.5 rounded uppercase leading-none">E</span>}
              <span className="text-xs tabular-nums">{formatDuration(track.duration_ms || 0)}</span>
            </div>
            <div className="flex items-center justify-end">
              {pt && (
                <button
                  onClick={(e) => openMenu(pt, e)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all p-0.5"
                  title="Add to playlist"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
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
          className="fixed z-50 bg-[var(--bg-secondary)] rounded-xl shadow-xl border border-[var(--border)] py-1.5 min-w-[200px] max-w-[260px] animate-scale-in"
          style={{ left: menuPos.adjustedX, top: menuPos.adjustedY }}
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
                  onClick={() => handleAddToPlaylist(pl.id, pl.name)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                >
                  <MusicNoteStrokeIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                  <span className="truncate">{pl.name}</span>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">{pl.tracks.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Play Next & Add to Queue */}
          <div className="border-t border-[var(--border)] pt-1 mt-1">
            <button
              onClick={() => { playNext(menuTrack!); setMenuOpen(false); showToast(`"${menuTrack!.name}" will play next`) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
            >
              <PlayIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Play Next</span>
            </button>
            <button
              onClick={() => { addToQueue(menuTrack!); setMenuOpen(false); showToast(`Added "${menuTrack!.name}" to queue`) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
            >
              <PlusIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Add to Queue</span>
            </button>
          </div>

          {/* Copy Link */}
          <div className="border-t border-[var(--border)] pt-1 mt-1">
            <button
              onClick={() => {
                const url = `${window.location.origin}/track/${menuTrack!.id}`
                const shareData = { title: menuTrack!.name, text: menuTrack!.name, url }
                if (navigator.share && navigator.canShare?.(shareData)) {
                  navigator.share(shareData).catch(() => {})
                } else {
                  navigator.clipboard.writeText(url).then(() => {
                    showToast(`Link copied: "${menuTrack!.name}"`)
                  }).catch(() => showToast("Failed to copy link"))
                }
                setMenuOpen(false)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
            >
              <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Share Track</span>
            </button>
          </div>

          {/* Go to Track & Go to Artist */}
          <div className="border-t border-[var(--border)] pt-1 mt-1">
            <Link
              href={`/track/${menuTrack!.id}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span>Go to Track</span>
            </Link>
            <Link
              href={`/artist/${menuTrack!.artistIds?.[0] || ""}`}
              onClick={(e) => { if (!menuTrack!.artistIds?.[0]) e.preventDefault(); setMenuOpen(false) }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-all ${menuTrack!.artistIds?.[0] ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]" : "text-[var(--text-muted)] cursor-not-allowed"}`}
            >
              <PersonIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Go to Artist</span>
            </Link>
          </div>

          <div className="border-t border-[var(--border)] pt-1.5 mt-1">
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
                <PlusIcon className="w-3.5 h-3.5" />
                <span>New Playlist</span>
              </button>
            )}
          </div>
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all border-t border-[var(--border)]"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Manage Playlists</span>
          </Link>
        </div>
      )}
    </div>
  )
}
