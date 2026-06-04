"use client"

import { useState, useRef, useEffect, createContext, useContext, type ReactNode } from "react"
import { formatDuration } from "@/lib/utils"
import type { PlayerTrack, RepeatMode } from "@/lib/types"
import ErrorBoundary from "./ErrorBoundary"
import QueuePanel from "./QueuePanel"
import { addToRecentlyPlayed } from "@/lib/recently-played"

export type { PlayerTrack }

interface PlayerContextType {
  currentTrack: PlayerTrack | null
  isPlaying: boolean
  queue: PlayerTrack[]
  queueIndex: number
  playTrack: (track: PlayerTrack) => void
  playAll: (tracks: PlayerTrack[], startIndex?: number) => void
  togglePlay: () => void
  nextTrack: () => void
  prevTrack: () => void
  seekTo: (time: number) => void
  setVolume: (vol: number) => void
  volume: number
  progress: number
  duration: number
  repeatMode: RepeatMode
  toggleRepeat: () => void
  shuffle: boolean
  toggleShuffle: () => void
  addToQueue: (track: PlayerTrack) => void
  playNext: (track: PlayerTrack) => void
  removeFromQueue: (queueIndex: number) => void
  moveInQueue: (fromIndex: number, toIndex: number) => void
  clearQueue: () => void
  queuePanelOpen: boolean
  setQueuePanelOpen: (open: boolean) => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider")
  return ctx
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState<PlayerTrack[]>([])
  const [queueIndex, setQueueIndex] = useState(-1)
  const [volume, setVolumeState] = useState(0.7)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off")
  const [shuffle, setShuffle] = useState(false)
  const [queuePanelOpen, setQueuePanelOpen] = useState(false)
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([])
  const [shuffleIndex, setShuffleIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Use refs to avoid stale closures in audio event handlers
  const nextTrackRef = useRef(nextTrack)
  nextTrackRef.current = nextTrack
  const repeatModeRef = useRef(repeatMode)
  repeatModeRef.current = repeatMode

  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = volume
    return () => { audioRef.current?.pause(); audioRef.current = null }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setProgress(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      if (repeatModeRef.current === "one") { audio.currentTime = 0; audio.play().catch(() => {}) }
      else nextTrackRef.current()
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onError = () => setIsPlaying(false)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("durationchange", onDurationChange)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("error", onError)
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("durationchange", onDurationChange)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("error", onError)
    }
  }, [currentTrack])

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])

  function playTrack(track: PlayerTrack) {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTrack(track)
    addToRecentlyPlayed(track)
    if (track.previewUrl) { audio.src = track.previewUrl; audio.play().catch(() => setIsPlaying(false)) }
    else setIsPlaying(false)
  }

  function playAll(tracks: PlayerTrack[], startIndex = 0) {
    setQueue(tracks)
    setQueueIndex(startIndex)
    if (shuffle) {
      const order = generateShuffleOrderFor(tracks, startIndex)
      setShuffleOrder(order)
      setShuffleIndex(0)
    }
    if (tracks[startIndex]) playTrack(tracks[startIndex])
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (isPlaying) audio.pause()
    else if (currentTrack.previewUrl) audio.play().catch(() => setIsPlaying(false))
  }

  function generateShuffleOrderFor(tracks: PlayerTrack[], currentIndex: number) {
    const upcoming = []
    for (let i = 0; i < tracks.length; i++) {
      if (i !== currentIndex) upcoming.push(i)
    }
    // Fisher-Yates shuffle
    for (let i = upcoming.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[upcoming[i], upcoming[j]] = [upcoming[j], upcoming[i]]
    }
    return upcoming
  }

  function generateShuffleOrder() {
    return generateShuffleOrderFor(queue, queueIndex)
  }

  function nextTrack() {
    if (queue.length === 0) return
    if (shuffle) {
      // Get next index from shuffle order
      let nextShuffleIdx = shuffleIndex + 1
      // If we've gone through all shuffled tracks, regenerate
      if (nextShuffleIdx >= shuffleOrder.length) {
        if (repeatMode === "all") {
          const newOrder = generateShuffleOrder()
          setShuffleOrder(newOrder)
          nextShuffleIdx = 0
        } else {
          return
        }
      }
      const nextIndex = shuffleOrder[nextShuffleIdx]
      if (nextIndex === undefined) return
      setShuffleIndex(nextShuffleIdx)
      setQueueIndex(nextIndex)
      playTrack(queue[nextIndex])
    } else {
      let nextIndex = queueIndex + 1
      if (nextIndex >= queue.length) {
        if (repeatMode === "all") nextIndex = 0
        else return
      }
      setQueueIndex(nextIndex)
      playTrack(queue[nextIndex])
    }
  }

  function prevTrack() {
    const audio = audioRef.current
    if (!audio || queue.length === 0) return
    if (audio.currentTime > 3) { audio.currentTime = 0; return }
    if (shuffle) {
      let prevShuffleIdx = shuffleIndex - 1
      if (prevShuffleIdx < 0) {
        if (repeatMode === "all") prevShuffleIdx = shuffleOrder.length - 1
        else return
      }
      const prevIndex = shuffleOrder[prevShuffleIdx]
      if (prevIndex === undefined) return
      setShuffleIndex(prevShuffleIdx)
      setQueueIndex(prevIndex)
      playTrack(queue[prevIndex])
    } else {
      let prevIndex = queueIndex - 1
      if (prevIndex < 0) {
        if (repeatMode === "all") prevIndex = queue.length - 1
        else return
      }
      setQueueIndex(prevIndex)
      playTrack(queue[prevIndex])
    }
  }

  function seekTo(time: number) { if (audioRef.current) audioRef.current.currentTime = time }
  function setVolume(vol: number) { setVolumeState(vol) }
  function toggleRepeat() { setRepeatMode((r) => r === "off" ? "all" : r === "all" ? "one" : "off") }
  function toggleShuffle() {
    setShuffle((prev) => {
      if (!prev) {
        // Turning shuffle ON: generate initial order
        const order = generateShuffleOrder()
        setShuffleOrder(order)
        setShuffleIndex(0)
      }
      return !prev
    })
  }

  function addToQueue(track: PlayerTrack) {
    setQueue((prev) => [...prev, track])
  }

  function playNext(track: PlayerTrack) {
    setQueue((prev) => {
      const next = [...prev]
      next.splice(queueIndex + 1, 0, track)
      return next
    })
  }

  function removeFromQueue(idx: number) {
    if (idx === queueIndex) return // Don't remove current track via this method
    setQueue((prev) => prev.filter((_, i) => i !== idx))
    if (idx < queueIndex) setQueueIndex((prev) => prev - 1)
  }

  function moveInQueue(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    setQueue((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
    // Adjust queueIndex if needed
    if (fromIndex === queueIndex) setQueueIndex(toIndex)
    else if (fromIndex < queueIndex && toIndex >= queueIndex) setQueueIndex((prev) => prev - 1)
    else if (fromIndex > queueIndex && toIndex <= queueIndex) setQueueIndex((prev) => prev + 1)
  }

  function clearQueue() {
    const track = queue[queueIndex]
    setQueue(track ? [track] : [])
    setQueueIndex(0)
  }

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, queue, queueIndex, playTrack, playAll, togglePlay, nextTrack, prevTrack, seekTo, setVolume, volume, progress, duration, repeatMode, toggleRepeat, shuffle, toggleShuffle, addToQueue, playNext, removeFromQueue, moveInQueue, clearQueue, queuePanelOpen, setQueuePanelOpen }}>
      {children}
      <ErrorBoundary label="Player Bar">
        <PlayerBar />
      </ErrorBoundary>
      <QueuePanel />
    </PlayerContext.Provider>
  )
}

function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, progress, duration, seekTo, volume, setVolume, repeatMode, toggleRepeat, shuffle, toggleShuffle, queue, queuePanelOpen, setQueuePanelOpen } = usePlayer()
  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)

  if (!currentTrack) return null

  const progressPercent = duration > 0 ? (isSeeking ? seekValue : (progress / duration) * 100) : 0

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 max-w-4xl mx-auto bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-[var(--border)] backdrop-blur-xl z-50 px-4 py-3">
      <div className="flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden">
            {currentTrack.albumImage ? (
              <img src={currentTrack.albumImage} alt={currentTrack.album} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{currentTrack.name}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{currentTrack.artists}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={prevTrack} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
          </button>
          <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm">
            {isPlaying ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button onClick={nextTrack} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </button>
        </div>

        {/* Progress */}
        <div className="hidden md:flex items-center gap-2 w-48">
          <span className="text-xs text-[var(--text-muted)] w-8 text-right tabular-nums">{formatDuration(Math.round(isSeeking ? (seekValue / 100) * duration : progress) * 1000)}</span>
          <div className="flex-1 h-1 bg-[var(--border)] rounded-full cursor-pointer group relative"
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * duration) }}
            onMouseEnter={() => setIsSeeking(true)} onMouseLeave={() => setIsSeeking(false)}
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSeekValue(((e.clientX - r.left) / r.width) * 100) }}>
            <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
          </div>
          <span className="text-xs text-[var(--text-muted)] w-8 tabular-nums">{formatDuration(Math.round(duration) * 1000)}</span>
        </div>

        {/* Queue button */}
        <button
          onClick={() => setQueuePanelOpen(!queuePanelOpen)}
          className={`relative flex-shrink-0 transition-all ${queuePanelOpen ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
          title="Queue"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {queue.length > 1 && (
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[var(--accent)] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {queue.length - 1}
            </span>
          )}
        </button>

        {/* Volume & extras */}
        <div className="hidden lg:flex items-center gap-2">
          <button onClick={toggleShuffle} className={`text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all ${shuffle ? "text-[var(--accent)]" : ""}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 17h16l-4-4m0 8l4-4M4 7h16l-4 4m0-8l4 4" />
            </svg>
          </button>
          <button onClick={toggleRepeat} className={`relative text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all ${repeatMode !== "off" ? "text-[var(--accent)]" : ""}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {repeatMode === "one" && <span className="absolute -top-1 -right-1 text-[8px] font-bold">1</span>}
          </button>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                {volume > 0 && <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072" />}
              </svg>
            </button>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-16 h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer accent-[var(--accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
