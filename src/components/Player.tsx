"use client"

import { useState, useRef, useEffect, createContext, useContext, type ReactNode } from "react"
import { formatDuration } from "@/lib/utils"
import type { PlayerTrack, RepeatMode } from "@/lib/types"

// Re-export for consuming components
export type { PlayerTrack }

interface PlayerContextType {
  currentTrack: PlayerTrack | null
  isPlaying: boolean
  queue: PlayerTrack[]
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
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = volume
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setProgress(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0
        audio.play()
      } else {
        nextTrack()
      }
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onError = () => {
      setIsPlaying(false)
      console.warn("Audio playback error")
    }

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
  }, [currentTrack, repeatMode])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  function playTrack(track: PlayerTrack) {
    const audio = audioRef.current
    if (!audio) return

    setCurrentTrack(track)
    if (track.previewUrl) {
      audio.src = track.previewUrl
      audio.play().catch(() => setIsPlaying(false))
    } else {
      setIsPlaying(false)
    }
  }

  function playAll(tracks: PlayerTrack[], startIndex = 0) {
    setQueue(tracks)
    setQueueIndex(startIndex)
    if (tracks[startIndex]) playTrack(tracks[startIndex])
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (isPlaying) {
      audio.pause()
    } else {
      if (currentTrack.previewUrl) {
        audio.play().catch(() => setIsPlaying(false))
      }
    }
  }

  function nextTrack() {
    if (queue.length === 0) return
    let nextIndex: number
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = queueIndex + 1
      if (nextIndex >= queue.length) {
        if (repeatMode === "all") {
          nextIndex = 0
        } else {
          return
        }
      }
    }
    setQueueIndex(nextIndex)
    playTrack(queue[nextIndex])
  }

  function prevTrack() {
    const audio = audioRef.current
    if (!audio || queue.length === 0) return
    if (audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    let prevIndex = queueIndex - 1
    if (prevIndex < 0) {
      if (repeatMode === "all") prevIndex = queue.length - 1
      else return
    }
    setQueueIndex(prevIndex)
    playTrack(queue[prevIndex])
  }

  function seekTo(time: number) {
    if (audioRef.current) audioRef.current.currentTime = time
  }

  function setVolume(vol: number) {
    setVolumeState(vol)
  }

  function toggleRepeat() {
    setRepeatMode((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"))
  }

  function toggleShuffle() {
    setShuffle((s) => !s)
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        playTrack,
        playAll,
        togglePlay,
        nextTrack,
        prevTrack,
        seekTo,
        setVolume,
        volume,
        progress,
        duration,
        repeatMode,
        toggleRepeat,
        shuffle,
        toggleShuffle,
      }}
    >
      {children}
      <PlayerBar />
    </PlayerContext.Provider>
  )
}

function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    progress,
    duration,
    seekTo,
    volume,
    setVolume,
    repeatMode,
    toggleRepeat,
    shuffle,
    toggleShuffle,
  } = usePlayer()

  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)

  if (!currentTrack) return null

  const progressPercent = duration > 0 ? (isSeeking ? seekValue : (progress / duration) * 100) : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-zinc-900/90 border-t border-white/5 backdrop-blur-xl z-50">
      <div className="flex items-center h-20 px-4 max-w-screen-2xl mx-auto gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-72 min-w-0">
          <div className="w-12 h-12 rounded-md bg-zinc-800 flex-shrink-0 overflow-hidden shadow-lg">
            {currentTrack.albumImage ? (
              <img src={currentTrack.albumImage} alt={currentTrack.album} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentTrack.name}</p>
            <p className="text-xs text-zinc-400 truncate hover:text-zinc-300 transition-colors cursor-pointer">{currentTrack.artists}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`text-zinc-400 hover:text-white transition-all ${shuffle ? "text-green-400" : ""}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 17h16l-4-4m0 8l4-4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16l-4 4m0-8l4 4" />
              </svg>
            </button>

            {/* Prev */}
            <button onClick={prevTrack} className="text-zinc-300 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            {/* Next */}
            <button onClick={nextTrack} className="text-zinc-300 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`relative text-zinc-400 hover:text-white transition-all ${
                repeatMode !== "off" ? "text-green-400" : ""
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {repeatMode === "one" && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold">1</span>
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center w-full gap-2">
            <span className="text-xs text-zinc-500 w-10 text-right tabular-nums">
              {formatDuration(Math.round(isSeeking ? (seekValue / 100) * duration : progress) * 1000)}
            </span>
            <div
              className="flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer group relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const percent = (e.clientX - rect.left) / rect.width
                seekTo(percent * duration)
              }}
              onMouseEnter={() => setIsSeeking(true)}
              onMouseLeave={() => setIsSeeking(false)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setSeekValue(((e.clientX - rect.left) / rect.width) * 100)
              }}
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-100 group-hover:bg-green-400"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 w-10 tabular-nums">
              {formatDuration(Math.round(duration) * 1000)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden lg:flex items-center gap-2 w-48 justify-end">
          <button
            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {volume === 0 ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </>
              )}
            </svg>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-green-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
          />
        </div>
      </div>
    </div>
  )
}
