"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { usePlayer } from "@/components/Player"
import Visualizer, { type VisualizerMode } from "@/components/Visualizer"
import LazyImage from "@/components/LazyImage"
import { formatDuration } from "@/lib/utils"
import LyricsDisplay from "@/components/LyricsDisplay"
import { LyricsIcon } from "@/components/Icons"
import {
  PlayIcon, PauseIcon, SkipPrevIcon, SkipNextIcon,
  HeartIcon, MusicNoteIcon, ArrowRightIcon, ShuffleIcon,
  RepeatIcon, VolumeIcon, QueueListIcon,
  GridIcon, ChevronLeftIcon,
} from "@/components/Icons"

const VISUALIZER_MODES: { value: VisualizerMode; label: string }[] = [
  { value: "bars", label: "Bars" },
  { value: "waveform", label: "Wave" },
  { value: "circular", label: "Circle" },
  { value: "particles", label: "Particles" },
]

export default function NowPlayingPage() {
  const {
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack,
    progress, duration, seekTo, volume, setVolume,
    repeatMode, toggleRepeat, shuffle, toggleShuffle,
    likedTracks, toggleLike, queue, queueIndex, queuePanelOpen, setQueuePanelOpen,
    showVisualizer, setShowVisualizer,
  } = usePlayer()

  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const [vizMode, setVizMode] = useState<VisualizerMode>("bars")
  const [showVizPicker, setShowVizPicker] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [trackKey, setTrackKey] = useState(0)
  const pageRef = useRef<HTMLDivElement>(null)

  // Animate on track change
  useEffect(() => {
    setTrackKey((k) => k + 1)
  }, [currentTrack?.id])

  // Remove main content padding for immersive full-screen experience
  useEffect(() => {
    const main = document.querySelector('main#main-content') as HTMLElement | null
    if (!main) return
    const originalPadding = main.style.paddingBottom
    main.style.paddingBottom = '0px'
    return () => {
      main.style.paddingBottom = originalPadding || ''
    }
  }, [])

  const enterFullscreen = useCallback(() => {
    const el = pageRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      el.requestFullscreen().catch(() => {})
    }
  }, [])

  if (!currentTrack) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex flex-col items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
            <MusicNoteIcon className="w-12 h-12 text-white/30" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No track playing</h2>
          <p className="text-sm text-white/40 mb-8">Select a track to start listening</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-2xl hover:opacity-90 transition-all hover:scale-105 active:scale-95"
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
    <div
      ref={pageRef}
      className="relative h-full w-full overflow-hidden select-none"
      style={{ background: "linear-gradient(135deg, #000 0%, #0a0a1a 50%, #000 100%)" }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-[0.03]"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, var(--accent) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, #6366f1 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, #8b5cf6 0%, transparent 50%)
            `,
            animation: "slowSpin 30s linear infinite",
          }}
        />
      </div>

      {/* Full-screen background visualizer */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
        <Visualizer key={`viz-${vizMode}`} barCount={72} variant="full" mode={vizMode} className="h-full" />
      </div>

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-6 md:pt-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-all text-sm"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Lyrics toggle */}
          <button
            onClick={() => setShowLyrics((v) => !v)}
            className={`p-2 rounded-xl transition-all ${
              showLyrics ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
            aria-label={showLyrics ? "Hide lyrics" : "Show lyrics"}
            title={showLyrics ? "Hide lyrics" : "Show lyrics"}
          >
            <LyricsIcon className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={enterFullscreen}
            className="p-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            aria-label="Toggle fullscreen"
            title="Toggle fullscreen"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* Visualizer toggle */}
          <div className="relative">
            <button
              onClick={() => setShowVizPicker((v) => !v)}
              className={`p-2 rounded-xl transition-all ${
                showVizPicker ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
              aria-label="Visualizer settings"
              title="Visualizer mode"
            >
              <GridIcon className="w-4 h-4" />
            </button>
            {showVizPicker && (
              <div className="absolute right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 min-w-[160px] shadow-2xl animate-scale-in z-30">
                <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                  <span>Visualizer</span>
                  <button
                    onClick={() => setShowVisualizer(!showVisualizer)}
                    className={`relative w-8 h-4 rounded-full transition-all ${
                      showVisualizer ? "bg-[var(--accent)]" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                        showVisualizer ? "translate-x-4" : ""
                      }`}
                    />
                  </button>
                </div>
                {showVisualizer && (
                  <div className="mt-1 space-y-0.5">
                    {VISUALIZER_MODES.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => { setVizMode(m.value); setShowVizPicker(false) }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-all ${
                          vizMode === m.value
                            ? "bg-white/10 text-white font-medium"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Queue button */}
          <button
            onClick={() => setQueuePanelOpen(!queuePanelOpen)}
            className={`relative p-2 rounded-xl transition-all ${
              queuePanelOpen ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
            aria-label="Queue"
            title="Queue"
          >
            <QueueListIcon className="w-4 h-4" />
            {queue.length > 1 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--accent)] text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                {queue.length - 1}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-4 gap-6 md:gap-8 -mt-8">
        {showLyrics ? (
          /* Lyrics panel */
          <div className="flex-1 w-full max-w-2xl animate-fade-in" key={`lyrics-${currentTrack.id}`}>
            <LyricsDisplay />
          </div>
        ) : (
          <>
        {/* Album art with spinning effect */}
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80">
          {/* Glow behind album art */}
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000"
            style={{
              background: `radial-gradient(circle, var(--accent) 0%, transparent 70%)`,
              transform: isPlaying ? "scale(1.2)" : "scale(1)",
            }}
          />

          {/* Vinyl record outer ring */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black p-2 shadow-2xl ${
              isPlaying ? "animate-spin-slow" : ""
            }`}
            style={{ animationDuration: "8s", animationTimingFunction: "linear" }}
          >
            {/* Record grooves */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-black/80 flex items-center justify-center">
              <div className="w-[85%] h-[85%] rounded-full ring-1 ring-white/5 flex items-center justify-center">
                <div className="w-[70%] h-[70%] rounded-full ring-1 ring-white/[0.03] flex items-center justify-center">
                  {/* Center label */}
                  <div className="w-[30%] h-[30%] rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 ring-1 ring-white/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Album art on top of vinyl */}
          <div
            className={`absolute inset-[18%] rounded-full overflow-hidden shadow-2xl ring-2 ring-white/10 transition-transform duration-700 ${
              isPlaying ? "animate-spin-slow" : ""
            }`}
            style={{ animationDuration: "8s", animationTimingFunction: "linear" }}
          >
            {currentTrack.albumImage ? (
              <LazyImage
                key={`art-${currentTrack.id}-${trackKey}`}
                src={currentTrack.albumImage}
                alt={currentTrack.album}
                className="w-full h-full object-cover animate-fade-in"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center animate-fade-in">
                <MusicNoteIcon className="w-12 h-12 text-zinc-600" />
              </div>
            )}
          </div>
        </div>

        {/* Track info */}
        <div className="text-center max-w-md animate-fade-in-up" key={`info-${currentTrack.id}-${trackKey}`}>
          <h1 className="text-xl md:text-2xl font-bold text-white truncate drop-shadow-lg">
            {currentTrack.name}
          </h1>
          <p className="text-sm text-white/50 mt-1 truncate">
            {currentTrack.artists}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md space-y-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div
            className="relative group cursor-pointer py-1"
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
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden group-hover:h-2 transition-all">
              <div
                className="h-full bg-white rounded-full transition-all duration-100 relative"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              >
                {/* Shimmer effect */}
                {isPlaying && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast rounded-full" />
                )}
              </div>
            </div>
            {/* Hover preview dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-white/20 scale-0 group-hover:scale-100"
              style={{ left: `${Math.min(progressPercent, 100)}%`, marginLeft: "-7px" }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/30 tabular-nums px-0.5">
            <span>{formatDuration(Math.round(isSeeking ? (seekValue / 100) * duration : progress) * 1000)}</span>
            <span>{formatDuration(Math.round(duration) * 1000)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5 md:gap-7 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`transition-all hover:scale-110 active:scale-90 ${
              shuffle ? "text-[var(--accent)]" : "text-white/40 hover:text-white/70"
            }`}
            aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
          >
            <ShuffleIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={prevTrack}
            className="text-white/50 hover:text-white transition-all hover:scale-110 active:scale-90"
            aria-label="Previous track"
          >
            <SkipPrevIcon className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl hover:shadow-2xl shadow-white/10"
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
            className="text-white/50 hover:text-white transition-all hover:scale-110 active:scale-90"
            aria-label="Next track"
          >
            <SkipNextIcon className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`relative transition-all hover:scale-110 active:scale-90 ${
              repeatMode !== "off" ? "text-[var(--accent)]" : "text-white/40 hover:text-white/70"
            }`}
            aria-label={repeatMode === "off" ? "Enable repeat" : repeatMode === "all" ? "Repeat one" : "Disable repeat"}
          >
            <RepeatIcon className="w-4 h-4 md:w-5 md:h-5" />
            {repeatMode === "one" && (
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold">1</span>
            )}
          </button>
        </div>

        {/* Volume + Like + Settings row */}
        <div className="flex items-center justify-center gap-6 w-full max-w-md animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          {/* Volume */}
          <div className="flex items-center gap-2 group">
            <button
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              className="text-white/30 hover:text-white/60 transition-colors"
              aria-label={volume === 0 ? "Unmute" : "Mute"}
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
            <div className="w-0 group-hover:w-20 md:group-hover:w-28 overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
          </div>

          {/* Like */}
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className={`transition-all hover:scale-110 active:scale-90 ${
              isLiked ? "text-red-500 scale-110" : "text-white/30 hover:text-white/60"
            }`}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <HeartIcon className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 flex items-center justify-center pb-6 md:pb-8 gap-4">
        {/* Current time info */}
        <span className="text-[10px] text-white/20 font-mono tabular-nums">
          {queue.length > 0 && queueIndex !== undefined ? (
            <>Track {queue.findIndex(t => t.id === currentTrack.id) + 1} of {queue.length}</>
          ) : null}
        </span>
        <span className="text-white/10">·</span>
        <Link
          href={`/track/${currentTrack.id}`}
          className="flex items-center gap-1 text-[11px] text-white/20 hover:text-white/50 transition-colors"
        >
          <span>Details</span>
          <ArrowRightIcon className="w-2.5 h-2.5" />
        </Link>
      </div>
    </div>
  )
}
