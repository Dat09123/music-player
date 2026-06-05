"use client"

import { useState, useRef, useEffect } from "react"
import { createPlaylist } from "@/lib/playlists"

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function CreatePlaylistModal({ onClose, onCreated }: Props) {
  const [playlistName, setPlaylistName] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  function handleCreate() {
    if (!playlistName.trim()) return
    createPlaylist({ name: playlistName.trim() })
    setPlaylistName("")
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => { onClose(); setPlaylistName("") }}>
      <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl border border-[var(--border)] w-80 p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Create Playlist</h3>
        <input
          ref={inputRef}
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { onClose(); setPlaylistName("") } }}
          placeholder="My Awesome Playlist"
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
          maxLength={100}
        />
        <div className="flex items-center justify-end gap-2 mt-4">
          <button onClick={() => { onClose(); setPlaylistName("") }} className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">Cancel</button>
          <button onClick={handleCreate} disabled={!playlistName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:opacity-90 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
        </div>
      </div>
    </div>
  )
}
