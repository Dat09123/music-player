"use client"

import { useState, useRef } from "react"
import { usePlayer } from "./Player"
import { formatDuration } from "@/lib/utils"
import LazyImage from "./LazyImage"

export default function QueuePanel() {
  const {
    queue, queueIndex, currentTrack,
    removeFromQueue, moveInQueue, clearQueue,
    playAll, queuePanelOpen, setQueuePanelOpen,
  } = usePlayer()

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  if (!queuePanelOpen) return null

  const upcoming = queue.slice(queueIndex + 1)
  const previous = queue.slice(0, queueIndex)

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handleDragLeave() {
    setDragOverIndex(null)
  }

  function handleDrop(index: number) {
    if (dragIndex !== null && dragIndex !== index) {
      moveInQueue(dragIndex, index)
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function handleDragEnd() {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={() => setQueuePanelOpen(false)}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] rounded-t-2xl shadow-xl border border-[var(--border)] max-h-[70vh] flex flex-col animate-scale-in"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Queue</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {upcoming.length} track{upcoming.length !== 1 ? "s" : ""} upcoming
              {previous.length > 0 && ` • ${previous.length} played`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-all"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setQueuePanelOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-3 py-2">
          {/* Now Playing */}
          {currentTrack && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] px-2 mb-1.5">Now Playing</p>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/20">
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden shadow-sm">
                  {currentTrack.albumImage ? (
                    <LazyImage src={currentTrack.albumImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{currentTrack.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{currentTrack.artists}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-end gap-[2px] h-3">
                    <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms", height: "60%" }} />
                    <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "100ms", height: "100%" }} />
                    <span className="w-[2px] bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "200ms", height: "40%" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Queue */}
          {upcoming.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] px-2 mb-1.5">Up Next</p>
              <div className="space-y-0.5">
                {upcoming.map((track, i) => {
                  const actualIndex = queueIndex + 1 + i
                  const isDragging = dragIndex === actualIndex
                  const isDragOver = dragOverIndex === actualIndex

                  return (
                    <div
                      key={`${track.id}-${actualIndex}`}
                      draggable
                      onDragStart={() => handleDragStart(actualIndex)}
                      onDragOver={(e) => handleDragOver(e, actualIndex)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDrop(actualIndex)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2 px-2 py-2 rounded-xl transition-all group
                        ${isDragging ? "opacity-50" : ""}
                        ${isDragOver ? "border-t-2 border-[var(--accent)]" : ""}
                        hover:bg-[var(--bg-hover)] cursor-default`}
                    >
                      {/* Drag handle */}
                      <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
                        </svg>
                      </div>

                      {/* Index */}
                      <span className="w-5 text-center text-xs tabular-nums text-[var(--text-muted)] flex-shrink-0">
                        {actualIndex + 1}
                      </span>

                      {/* Track image */}
                      <div className="w-8 h-8 rounded-md bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden">
                        {track.albumImage ? (
                          <LazyImage src={track.albumImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                          </div>
                        )}
                      </div>

                      {/* Track info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[var(--text-primary)] truncate">{track.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">{track.artists}</p>
                      </div>

                      {/* Duration */}
                      <span className="text-xs tabular-nums text-[var(--text-muted)] flex-shrink-0">{formatDuration(track.duration)}</span>

                      {/* Remove button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromQueue(actualIndex) }}
                        className="flex-shrink-0 p-1 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove from queue"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Play button */}
                      <button
                        onClick={() => playAll(queue, actualIndex)}
                        className="flex-shrink-0 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] opacity-0 group-hover:opacity-100 transition-all"
                        title="Play now"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p className="text-sm font-medium">Queue is empty</p>
              <p className="text-xs mt-1">Add tracks from any playlist or album</p>
            </div>
          )}

          {/* Previously played hint */}
          {previous.length > 0 && queue.length > 1 && (
            <div className="mt-4 pt-3 border-t border-[var(--border)] px-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                {previous.length} track{previous.length !== 1 ? "s" : ""} played
              </p>
            </div>
          )}
        </div>

        {/* Keyboard hint */}
        <div className="px-5 py-2.5 border-t border-[var(--border)] flex-shrink-0">
          <p className="text-[11px] text-[var(--text-muted)] text-center">
            Drag to reorder • Click <span className="text-[var(--text-secondary)]">×</span> to remove
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
