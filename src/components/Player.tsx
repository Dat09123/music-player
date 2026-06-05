"use client"

import { useState, useRef, useEffect, createContext, useContext, type ReactNode } from "react"
import dynamic from "next/dynamic"
import { formatDuration } from "@/lib/utils"
import type { PlayerTrack, RepeatMode } from "@/lib/types"
import ErrorBoundary from "./ErrorBoundary"
import LazyImage from "./LazyImage"
import { addToRecentlyPlayed } from "@/lib/recently-played"
import { MusicNoteIcon, PlayIcon, PauseIcon, SkipPrevIcon, SkipNextIcon, HeartIcon, ShuffleIcon, RepeatIcon, VolumeIcon, QueueListIcon, SettingsIcon, MoonIcon, XIcon, PlusIcon } from "@/components/Icons"
import Visualizer from "./Visualizer"

const QueuePanel = dynamic(() => import("./QueuePanel"), { ssr: false })

export type { PlayerTrack }

const LIKED_KEY = "muse-liked-tracks"
const LIKED_DATA_KEY = "muse-liked-data"
function getLiked(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]")) } catch { return new Set() }
}
function saveLiked(ids: Set<string>) {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...ids]))
}
function getLikedData(): PlayerTrack[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(LIKED_DATA_KEY) || "[]") } catch { return [] }
}

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
  // Sleep timer
  sleepTimer: number | null
  setSleepTimer: (minutes: number | null) => void
  sleepRemaining: number | null
  // Crossfade
  crossfade: number
  setCrossfade: (seconds: number) => void
  // Liked
  likedTracks: Set<string>
  toggleLike: (id: string) => void
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
  const [volume, setVolumeState] = useState(() => typeof window !== 'undefined' ? parseFloat(localStorage.getItem('muse-volume') || '0.7') : 0.7)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(() => typeof window !== 'undefined' ? (localStorage.getItem('muse-repeat') as RepeatMode) || 'off' : 'off')
  const [shuffle, setShuffle] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('muse-shuffle') === 'true' : false)
  const [queuePanelOpen, setQueuePanelOpen] = useState(false)
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([])
  const [shuffleIndex, setShuffleIndex] = useState(0)
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null)
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null)
  const [crossfade, setCrossfadeState] = useState(0)
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const crossfadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const nextTrackRef = useRef(nextTrack)
  nextTrackRef.current = nextTrack
  const repeatModeRef = useRef(repeatMode)
  repeatModeRef.current = repeatMode
  const crossfadeRef = useRef(crossfade)
  crossfadeRef.current = crossfade
  const volumeRef = useRef(volume)
  volumeRef.current = volume

  // Load liked tracks on mount
  useEffect(() => { setLikedTracks(getLiked()) }, [])

  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = volume
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
      if (crossfadeTimerRef.current) clearInterval(crossfadeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => {
      setProgress(audio.currentTime)
      // Crossfade: start fading out near the end
      const cf = crossfadeRef.current
      if (cf > 0 && audio.duration > 0) {
        const remaining = audio.duration - audio.currentTime
        if (remaining <= cf && remaining > 0) {
          audio.volume = Math.max(0, volumeRef.current * (remaining / cf))
        }
      }
    }
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      audio.volume = volumeRef.current
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
  useEffect(() => { localStorage.setItem("muse-volume", String(volume)) }, [volume])
  useEffect(() => { localStorage.setItem("muse-repeat", repeatMode) }, [repeatMode])
  useEffect(() => { localStorage.setItem("muse-shuffle", String(shuffle)) }, [shuffle])

  // Sleep timer
  useEffect(() => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current)
    if (sleepTimer === null) { setSleepRemaining(null); return }
    setSleepRemaining(sleepTimer * 60)
    sleepTimerRef.current = setInterval(() => {
      setSleepRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(sleepTimerRef.current!)
          audioRef.current?.pause()
          setSleepTimerState(null)
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (sleepTimerRef.current) clearInterval(sleepTimerRef.current) }
  }, [sleepTimer])

  // Media Session API
  useEffect(() => {
    if (!currentTrack || typeof navigator === "undefined" || !("mediaSession" in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.name,
      artist: currentTrack.artists,
      album: currentTrack.album,
      artwork: currentTrack.albumImage ? [{ src: currentTrack.albumImage, sizes: "512x512", type: "image/jpeg" }] : [],
    })
    navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play().catch(() => {}))
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause())
    navigator.mediaSession.setActionHandler("nexttrack", () => nextTrackRef.current())
    navigator.mediaSession.setActionHandler("previoustrack", () => prevTrackRef.current())
    return () => {
      navigator.mediaSession.setActionHandler("play", null)
      navigator.mediaSession.setActionHandler("pause", null)
      navigator.mediaSession.setActionHandler("nexttrack", null)
      navigator.mediaSession.setActionHandler("previoustrack", null)
    }
  }, [currentTrack])

  // Update media session playback state
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused"
  }, [isPlaying])

  function playTrack(track: PlayerTrack) {
    const audio = audioRef.current
    if (!audio) return
    // Crossfade: fade in new track
    if (crossfadeRef.current > 0) {
      audio.volume = 0
      if (track.previewUrl) {
        audio.src = track.previewUrl
        audio.play().catch(() => setIsPlaying(false))
        let elapsed = 0
        const step = 50
        const cf = crossfadeRef.current * 1000
        if (crossfadeTimerRef.current) clearInterval(crossfadeTimerRef.current)
        crossfadeTimerRef.current = setInterval(() => {
          elapsed += step
          if (audio) audio.volume = Math.min(volumeRef.current, volumeRef.current * (elapsed / cf))
          if (elapsed >= cf) clearInterval(crossfadeTimerRef.current!)
        }, step)
      }
    } else {
      if (track.previewUrl) { audio.src = track.previewUrl; audio.play().catch(() => setIsPlaying(false)) }
      else setIsPlaying(false)
    }
    setCurrentTrack(track)
    addToRecentlyPlayed(track)
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
    for (let i = 0; i < tracks.length; i++) { if (i !== currentIndex) upcoming.push(i) }
    for (let i = upcoming.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[upcoming[i], upcoming[j]] = [upcoming[j], upcoming[i]]
    }
    return upcoming
  }

  function generateShuffleOrder() { return generateShuffleOrderFor(queue, queueIndex) }

  function nextTrack() {
    if (queue.length === 0) return
    if (shuffle) {
      let nextShuffleIdx = shuffleIndex + 1
      if (nextShuffleIdx >= shuffleOrder.length) {
        if (repeatMode === "all") { const newOrder = generateShuffleOrder(); setShuffleOrder(newOrder); nextShuffleIdx = 0 }
        else return
      }
      const nextIndex = shuffleOrder[nextShuffleIdx]
      if (nextIndex === undefined) return
      setShuffleIndex(nextShuffleIdx); setQueueIndex(nextIndex); playTrack(queue[nextIndex])
    } else {
      let nextIndex = queueIndex + 1
      if (nextIndex >= queue.length) { if (repeatMode === "all") nextIndex = 0; else return }
      setQueueIndex(nextIndex); playTrack(queue[nextIndex])
    }
  }

  const prevTrackRef = useRef(prevTrack)
  prevTrackRef.current = prevTrack

  function prevTrack() {
    const audio = audioRef.current
    if (!audio || queue.length === 0) return
    if (audio.currentTime > 3) { audio.currentTime = 0; return }
    if (shuffle) {
      let prevShuffleIdx = shuffleIndex - 1
      if (prevShuffleIdx < 0) { if (repeatMode === "all") prevShuffleIdx = shuffleOrder.length - 1; else return }
      const prevIndex = shuffleOrder[prevShuffleIdx]
      if (prevIndex === undefined) return
      setShuffleIndex(prevShuffleIdx); setQueueIndex(prevIndex); playTrack(queue[prevIndex])
    } else {
      let prevIndex = queueIndex - 1
      if (prevIndex < 0) { if (repeatMode === "all") prevIndex = queue.length - 1; else return }
      setQueueIndex(prevIndex); playTrack(queue[prevIndex])
    }
  }

  function seekTo(time: number) { if (audioRef.current) audioRef.current.currentTime = time }
  function setVolume(vol: number) { setVolumeState(vol) }
  function toggleRepeat() { setRepeatMode((r) => r === "off" ? "all" : r === "all" ? "one" : "off") }
  function toggleShuffle() {
    setShuffle((prev) => {
      if (!prev) { const order = generateShuffleOrder(); setShuffleOrder(order); setShuffleIndex(0) }
      return !prev
    })
  }
  function addToQueue(track: PlayerTrack) { setQueue((prev) => [...prev, track]) }
  function playNext(track: PlayerTrack) {
    setQueue((prev) => { const next = [...prev]; next.splice(queueIndex + 1, 0, track); return next })
  }
  function removeFromQueue(idx: number) {
    if (idx === queueIndex) return
    setQueue((prev) => prev.filter((_, i) => i !== idx))
    if (idx < queueIndex) setQueueIndex((prev) => prev - 1)
  }
  function moveInQueue(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    setQueue((prev) => { const next = [...prev]; const [moved] = next.splice(fromIndex, 1); next.splice(toIndex, 0, moved); return next })
    if (fromIndex === queueIndex) setQueueIndex(toIndex)
    else if (fromIndex < queueIndex && toIndex >= queueIndex) setQueueIndex((prev) => prev - 1)
    else if (fromIndex > queueIndex && toIndex <= queueIndex) setQueueIndex((prev) => prev + 1)
  }
  function clearQueue() { const track = queue[queueIndex]; setQueue(track ? [track] : []); setQueueIndex(0) }

  function setSleepTimer(minutes: number | null) { setSleepTimerState(minutes) }
  function setCrossfade(seconds: number) { setCrossfadeState(seconds) }
  function toggleLike(id: string, trackData?: PlayerTrack) {
    setLikedTracks(prev => {
      const next = new Set(prev)
      const adding = !next.has(id)
      if (adding) next.add(id); else next.delete(id)
      saveLiked(next)
      
      // Find track: passed in, or from queue, or from currentTrack, or from likedData
      const track = trackData || queue.find(t => t.id === id) || (currentTrack?.id === id ? currentTrack : null) || getLikedData().find(t => t.id === id)
      
      if (adding && track) {
        // Add to data
        const data = getLikedData()
        if (!data.find(t => t.id === track.id)) {
          data.unshift(track)
          localStorage.setItem(LIKED_DATA_KEY, JSON.stringify(data))
        }
      } else if (!adding) {
        // Remove from data even if track not found
        const data = getLikedData().filter(t => t.id !== id)
        localStorage.setItem(LIKED_DATA_KEY, JSON.stringify(data))
      }
      
      return next
    })
  }

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, queue, queueIndex, playTrack, playAll, togglePlay,
      nextTrack, prevTrack, seekTo, setVolume, volume, progress, duration,
      repeatMode, toggleRepeat, shuffle, toggleShuffle, addToQueue, playNext,
      removeFromQueue, moveInQueue, clearQueue, queuePanelOpen, setQueuePanelOpen,
      sleepTimer, setSleepTimer, sleepRemaining, crossfade, setCrossfade,
      likedTracks, toggleLike,
    }}>
      {children}
      <ErrorBoundary label="Player Bar">
        <PlayerBar />
      </ErrorBoundary>
      <QueuePanel />
    </PlayerContext.Provider>
  )
}

function PlayerBar() {
  const {
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, progress, duration,
    seekTo, volume, setVolume, repeatMode, toggleRepeat, shuffle, toggleShuffle,
    queue, queuePanelOpen, setQueuePanelOpen,
    sleepTimer, setSleepTimer, sleepRemaining,
    crossfade, setCrossfade,
    likedTracks, toggleLike,
  } = usePlayer()

  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  // Swipe gesture on mobile
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return // mostly vertical — ignore
    if (Math.abs(dx) < 50) return // too short
    if (dx < 0) nextTrack()
    else prevTrack()
  }

  if (!currentTrack) return null

  const progressPercent = duration > 0 ? (isSeeking ? seekValue : (progress / duration) * 100) : 0
  const isLiked = likedTracks.has(currentTrack.id)

  return (
    <>
      <div
        className="fixed bottom-16 md:bottom-4 left-4 right-4 max-w-4xl mx-auto glass rounded-2xl shadow-xl border border-[var(--border)] z-50 px-4 py-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-hover)] flex-shrink-0 overflow-hidden relative">
              {currentTrack.albumImage ? (
                <LazyImage src={currentTrack.albumImage} alt={currentTrack.album} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MusicNoteIcon className="w-5 h-5" />
                </div>
              )}
              {/* Visualizer overlay on album art when playing */}
              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-0.5">
                  <div className="flex items-end gap-[1.5px] h-3">
                    <span className="w-[2px] bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms", height: "40%" }} />
                    <span className="w-[2px] bg-white rounded-full animate-bounce" style={{ animationDelay: "80ms", height: "80%" }} />
                    <span className="w-[2px] bg-white rounded-full animate-bounce" style={{ animationDelay: "160ms", height: "60%" }} />
                    <span className="w-[2px] bg-white rounded-full animate-bounce" style={{ animationDelay: "240ms", height: "100%" }} />
                  </div>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{currentTrack.name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{currentTrack.artists}</p>
              {/* Animated visualizer bar below track info */}
              <div className="mt-1 max-w-[120px]">
                <Visualizer barCount={12} variant="mini" />
              </div>
            </div>
          </div>

          {/* Heart button */}
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className={`flex-shrink-0 transition-all ${isLiked ? "text-red-500 scale-110" : "text-[var(--text-muted)] hover:text-red-400"}`}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <HeartIcon className={`w-4 h-4 ${isLiked ? "text-red-500" : ""}`} fill={isLiked ? "currentColor" : "none"} />
          </button>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button onClick={prevTrack} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Previous track">
              <SkipPrevIcon className="w-4 h-4" />
            </button>
            <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:opacity-90 hover:shadow-glow transition-all shadow-md" aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? (
                <PauseIcon className="w-3.5 h-3.5" />
              ) : (
                <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>
            <button onClick={nextTrack} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Next track">
              <SkipNextIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="hidden md:flex items-center gap-2 w-48">
            <span className="text-xs text-[var(--text-muted)] w-8 text-right tabular-nums">{formatDuration(Math.round(isSeeking ? (seekValue / 100) * duration : progress) * 1000)}</span>
            <div className="flex-1 h-1 bg-[var(--border)] rounded-full cursor-pointer group relative"
              onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * duration) }}
              onMouseEnter={() => setIsSeeking(true)} onMouseLeave={() => setIsSeeking(false)}
              onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSeekValue(((e.clientX - r.left) / r.width) * 100) }}>
              <div className="h-full bg-gradient-to-r from-[var(--accent)] to-indigo-400 rounded-full transition-all shadow-sm" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
            </div>
            <span className="text-xs text-[var(--text-muted)] w-8 tabular-nums">{formatDuration(Math.round(duration) * 1000)}</span>
          </div>

          {/* Queue button */}
          <button
            onClick={() => setQueuePanelOpen(!queuePanelOpen)}
            className={`relative flex-shrink-0 transition-all ${queuePanelOpen ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            aria-label="Queue"
          >
            <QueueListIcon className="w-4 h-4" />
            {queue.length > 1 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[var(--accent)] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {queue.length - 1}
              </span>
            )}
          </button>

          {/* Volume & extras */}
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={toggleShuffle} className={`text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all ${shuffle ? "text-[var(--accent)]" : ""}`} aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}>
              <ShuffleIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={toggleRepeat} className={`relative text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all ${repeatMode !== "off" ? "text-[var(--accent)]" : ""}`} aria-label={repeatMode === "off" ? "Enable repeat" : repeatMode === "all" ? "Repeat one" : "Disable repeat"}>
              <RepeatIcon className="w-3.5 h-3.5" />
              {repeatMode === "one" && <span className="absolute -top-1 -right-1 text-[8px] font-bold">1</span>}
            </button>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label={volume === 0 ? "Unmute" : "Mute"}>
                <VolumeIcon className="w-3.5 h-3.5" />
              </button>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-16 h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer accent-[var(--accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]" />
            </div>

            {/* Settings button (sleep timer + crossfade) */}
            <button
              onClick={() => setShowSettings(v => !v)}
              className={`text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all relative ${sleepTimer !== null ? "text-amber-400" : ""}`}
              aria-label="Player settings"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              {sleepTimer !== null && sleepRemaining !== null && (
                <span className="absolute -top-2 -right-2 text-[7px] font-bold bg-amber-400 text-black rounded-full px-0.5 leading-tight">
                  {Math.ceil(sleepRemaining / 60)}m
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile swipe hint */}
        <p className="md:hidden text-center text-[9px] text-[var(--text-muted)] mt-1 opacity-50">swipe ← → to skip</p>
        
        {/* Mobile progress bar */}
        <div className="md:hidden mt-2">
          <div
            className="h-1 bg-[var(--border)] rounded-full cursor-pointer relative"
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * duration) }}
            onTouchStart={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo(((e.touches[0].clientX - r.left) / r.width) * duration) }}
          >
            <div className="h-full bg-gradient-to-r from-[var(--accent)] to-indigo-400 rounded-full" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Settings panel (sleep timer + crossfade) */}
      {showSettings && (
        <div className="fixed bottom-36 md:bottom-24 right-4 z-50 bg-[var(--bg-secondary)] rounded-2xl shadow-xl border border-[var(--border)] p-4 w-64 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Player Settings</h3>
            <button onClick={() => setShowSettings(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Sleep Timer */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MoonIcon className="w-3 h-3" />
              Sleep Timer {sleepRemaining !== null && <span className="text-amber-400 normal-case font-normal">({Math.floor(sleepRemaining / 60)}:{String(sleepRemaining % 60).padStart(2, "0")} left)</span>}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[5, 10, 15, 30, 60].map(m => (
                <button
                  key={m}
                  onClick={() => setSleepTimer(sleepTimer === m ? null : m)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all ${sleepTimer === m ? "bg-amber-400 text-black font-semibold" : "bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                >
                  {m}m
                </button>
              ))}
              {sleepTimer !== null && (
                <button onClick={() => setSleepTimer(null)} className="px-2.5 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                  Off
                </button>
              )}
            </div>
          </div>

          {/* Crossfade */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Crossfade: {crossfade}s
            </p>
            <input
              type="range" min="0" max="8" step="1" value={crossfade}
              onChange={(e) => setCrossfade(parseInt(e.target.value))}
              className="w-full h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
              <span>Off</span><span>8s</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
