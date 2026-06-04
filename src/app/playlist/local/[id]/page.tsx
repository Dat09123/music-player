"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getPlaylist, deletePlaylist, renamePlaylist, removeTrackFromPlaylist } from "@/lib/playlists"
import { usePlayer } from "@/components/Player"
import { formatDuration } from "@/lib/utils"
import type { LocalPlaylist, PlayerTrack } from "@/lib/types"

export default function LocalPlaylistPage() {
  const params = useParams()
  const id = params.id as string
  const [playlist, setPlaylist] = useState<LocalPlaylist | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { playAll, currentTrack, isPlaying } = usePlayer()

  function refresh() {
    const pl = getPlaylist(id)
    setPlaylist(pl ?? null)
  }

  useEffect(() => { refresh() }, [id])

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Playlist not found</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">This playlist may have been deleted.</p>
        <Link href="/" className="bg-[var(--accent)] hover:opacity-90 text-white font-medium px-5 py-2 rounded-lg text-sm transition-all">
          Go Home
        </Link>
      </div>
    )
  }

  function handlePlayAll() {
    if (!playlist || playlist.tracks.length === 0) return
    playAll(playlist.tracks, 0)
  }

  function handlePlay(index: number) {
    if (!playlist || !playlist.tracks[index]) return
    playAll(playlist.tracks, index)
  }

  function handleDelete() {
    deletePlaylist(id)
    window.location.href = "/"
  }

  function handleRename() {
    if (editName.trim()) {
      renamePlaylist(id, editName.trim())
      setIsEditing(false)
      refresh()
    }
  }

  const playerTracks = playlist.tracks

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[var(--accent-light)] to-[var(--bg-primary)] px-6 pt-12 pb-8">
        <div className="flex items-end gap-6">
          {/* Cover */}
          <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-600 shadow-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-20 h-20 text-white/80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Playlist</p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setIsEditing(false) }}
                  className="text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-[var(--accent)] text-[var(--text-primary)] focus:outline-none"
                  autoFocus
                  maxLength={100}
                />
                <button onClick={handleRename} className="text-[var(--accent)] hover:opacity-80 text-sm font-medium">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] truncate">{playlist.name}</h1>
                <button onClick={() => { setEditName(playlist.name); setIsEditing(true) }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mt-1">
              <span>{playlist.tracks.length} tracks</span>
              <span>•</span>
              <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-6 py-4">
        <button
          onClick={handlePlayAll}
          disabled={playlist.tracks.length === 0}
          className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:opacity-90 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-[var(--text-muted)] hover:text-red-500 transition-all p-2"
          title="Delete playlist"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Track list */}
      <div className="px-4 pb-8">
        {playerTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
            <svg className="w-14 h-14 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="text-sm font-medium mb-1">This playlist is empty</p>
            <p className="text-xs">Search for tracks and &quot;Add to Playlist&quot; to fill it up</p>
            <Link href="/search" className="mt-4 text-sm text-[var(--accent)] hover:underline font-medium">Search music →</Link>
          </div>
        ) : (
          <div className="space-y-0.5">
            <div className="grid grid-cols-[32px_1fr_64px_28px] gap-3 px-4 py-1.5 text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
              <span className="text-center">#</span>
              <span>Title</span>
              <span className="text-right">
                <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <span></span>
            </div>
            {playerTracks.map((track, i) => {
              const isCurrent = currentTrack?.id === track.id
              return (
                <div
                  key={`${track.id}-${i}`}
                  className={`grid grid-cols-[32px_1fr_64px_28px] gap-3 px-4 py-2 rounded-lg group cursor-pointer transition-all hover:bg-gray-50 ${isCurrent ? "text-[var(--accent)] bg-indigo-50/50" : "text-[var(--text-secondary)]"}`}
                  onClick={() => handlePlay(i)}
                >
                  <div className="flex items-center justify-center">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-end gap-[2px] h-3">
                        <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms", height: "60%" }} />
                        <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "100ms", height: "100%" }} />
                        <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "200ms", height: "40%" }} />
                      </div>
                    ) : (
                      <><span className="group-hover:hidden text-xs tabular-nums">{i + 1}</span><svg className="hidden group-hover:block w-3.5 h-3.5 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden hidden sm:block">
                      {track.albumImage ? (
                        <img src={track.albumImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${isCurrent ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>{track.name}</p>
                      <p className="text-xs truncate text-[var(--text-muted)]">{track.artists}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-xs tabular-nums">{formatDuration(track.duration * 1000)}</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTrackFromPlaylist(id, track.id); refresh() }}
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 transition-all p-0.5"
                      title="Remove from playlist"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-xl border border-[var(--border)] w-80 p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Delete &quot;{playlist.name}&quot;?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">This action cannot be undone. All tracks will be removed.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
