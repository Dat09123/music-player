"use client"

import { useState } from "react"
import Link from "next/link"
import { usePlayer } from "@/components/Player"
import Visualizer from "@/components/Visualizer"
import LazyImage from "@/components/LazyImage"
import { formatDuration } from "@/lib/utils"
import {
  PlayIcon, PauseIcon, SkipPrevIcon, SkipNextIcon,
  HeartIcon, MusicNoteIcon, ArrowRightIcon, ShuffleIcon,
  RepeatIcon, VolumeIcon,
} from "@/components/Icons"

export default function NowPlayingPage() {
  const {
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack,
    progress, duration, seekTo, volume, setVolume,
    repeatMode, toggleRepeat, shuffle, toggleShuffle,
    likedTracks, toggleLike,
  } = usePlayer()

  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)

  if (!currentTrack) {
    return (
      <div className="h-full w-full bg-[var(--bg-primary)] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center">
            <MusicNoteIcon className="w-12 h-12 text-[var(--text-muted)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No track playing</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Select a track to start listening</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all"
          >
            Browse Music
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  const progressPercent = duration > 0 ? (isSeeking ? seekValue : (progress / duration) * 100) : 0
  const isLiked = likedTracks.has(currentTrack.id)

  return (
    <div className="relative h-full w-full bg-black flex flex-col animate-fade-in overflow-hidden">
      {/* Full-screen background visualizer */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Visualizer barCount={64} variant="full" mode="bars" className="h-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-8 gap-6 md:gap-8">
        {/* Album art */}
        <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10 shadow-black/30">
            {currentTrack.albumImage ? (
              <LazyImage
                src={currentTrack.albumImage}
                alt={currentTrack.album}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                <MusicNoteIcon className="w-16 h-16 text-zinc-600" />
              </div>
            )}
          </div>
        </div>

        {/* Track info */}
        <div className="text-center max-w-md">
          <h1 className="text-xl md:text-2xl font-bold text-white truncate">
            {currentTrack.name}
          </h1>
          <p className="text-sm text-white/60 mt-1 truncate">
            {currentTrack.artists}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="relative group cursor-pointer"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              seekTo(((e.clientX - r.left) / r.width) * duration)
            }}
            onMouseEnter={() => setIsSeeking(true)}
            onMouseLeave={() => setIsSeeking(false)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              setSeekValue(((e.clientX - r.left) / r.width) * 100)
            }}
          >
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent)] to-indigo-400 rounded-full transition-all duration-100"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            {/* Hover preview dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              style={{ left: `${Math.min(progressPercent, 100)}%`, marginLeft: "-6px" }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 tabular-nums">
            <span>{formatDuration(Math.round(isSeeking ? (seekValue / 100) * duration : progress) * 1000)}</span>
            <span>{formatDuration(Math.round(duration) * 1000)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`transition-all ${shuffle ? "text-[var(--accent)]" : "text-white/50 hover:text-white"}`}
            aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
          >
            <ShuffleIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={prevTrack}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Previous track"
          >
            <SkipPrevIcon className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <PauseIcon className="w-6 h-6 md:w-7 md:h-7" />
            ) : (
              <PlayIcon className="w-6 h-6 md:w-7 md:h-7 ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Next track"
          >
            <SkipNextIcon className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`relative transition-all ${repeatMode !== "off" ? "text-[var(--accent)]" : "text-white/50 hover:text-white"}`}
            aria-label={repeatMode === "off" ? "Enable repeat" : repeatMode === "all" ? "Repeat one" : "Disable repeat"}
          >
            <RepeatIcon className="w-4 h-4 md:w-5 md:h-5" />
            {repeatMode === "one" && (
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold">1</span>
            )}
          </button>
        </div>

        {/* Volume + Like row */}
        <div className="flex items-center justify-center gap-6 w-full max-w-md">
          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              className="text-white/40 hover:text-white/70 transition-colors"
              aria-label={volume === 0 ? "Unmute" : "Mute"}
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 md:w-28 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          {/* Like */}
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className={`transition-all ${isLiked ? "text-red-500 scale-110" : "text-white/40 hover:text-white/70"}`}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <HeartIcon className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Bottom bar — link to track page */}
      <div className="relative z-10 flex items-center justify-center pb-6 md:pb-8">
        <Link
          href={`/track/${currentTrack.id}`}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          <span>View track details</span>
          <ArrowRightIcon className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
