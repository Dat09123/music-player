"use client"

import { useEffect } from "react"
import { usePlayer } from "./Player"
import SyncedLyrics from "./SyncedLyrics"
import LazyImage from "./LazyImage"
import { formatDuration } from "@/lib/utils"
import { PlayIcon, PauseIcon, SkipPrevIcon, SkipNextIcon, ChevronLeftIcon, MusicNoteIcon } from "@/components/Icons"
import Visualizer from "./Visualizer"

interface Props {
  track: any
  syncedLyrics: string | null
  lyrics: string | null
  lyricsMode: "plain" | "synced"
  onClose: () => void
}

export default function CinemaMode({ track, syncedLyrics, lyrics, lyricsMode, onClose }: Props) {
  const { progress, duration, isPlaying, togglePlay, currentTrack, nextTrack, prevTrack } = usePlayer()

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  const albumImage = track.album?.images?.[0]?.url || track.album?.images?.[1]?.url || ""

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in overflow-hidden">
      {/* Animated background visualizer */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <Visualizer barCount={48} variant="full" className="h-full" />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 z-10">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Exit Cinema</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 tabular-nums">
            {formatDuration(Math.round(progress) * 1000)} / {formatDuration(Math.round(duration) * 1000)}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 pb-4 overflow-hidden">
        {/* Album art */}
        <div className="flex-shrink-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10">
            {albumImage ? (
              <LazyImage
                src={albumImage}
                alt={track.album?.name || track.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
              <MusicNoteIcon className="w-20 h-20 text-zinc-600" />
              </div>
            )}
          </div>

          {/* Track info below album art */}
          <div className="text-center mt-4 hidden lg:block">
            <p className="text-white font-semibold text-lg truncate max-w-xs mx-auto">{track.name}</p>
            <p className="text-white/50 text-sm truncate max-w-xs mx-auto mt-1">
              {track.artists?.map((a: any) => a.name).join(", ")}
            </p>
          </div>
        </div>

        {/* Lyrics */}
        <div className="flex-1 w-full max-w-2xl lg:max-w-xl xl:max-w-2xl max-h-[60vh] lg:max-h-[70vh] overflow-hidden">
          {lyricsMode === "synced" && syncedLyrics ? (
            <SyncedLyrics syncedLyrics={syncedLyrics} cinemaMode={true} />
          ) : lyrics ? (
            <div className="text-white/80 text-lg leading-relaxed whitespace-pre-line text-center lg:text-left overflow-y-auto h-full scroll-smooth px-4 [&::-webkit-scrollbar]:hidden scrollbar-none">
              {lyrics.split("\n").map((line, i) => (
                <p key={i} className={line.trim() === "" ? "h-4" : "mb-2"}>
                  {line || "\u00A0"}
                </p>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/30 text-lg">No lyrics available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-6 px-6 py-4">
        <button onClick={prevTrack} className="text-white/50 hover:text-white transition-colors">
          <SkipPrevIcon className="w-6 h-6" />
        </button>
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5 ml-0.5" />
          )}
        </button>
        <button onClick={nextTrack} className="text-white/50 hover:text-white transition-colors">
          <SkipNextIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/10 mx-6 mb-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-200"
          style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
        />
      </div>

      {/* Styles are handled via cinemaMode prop on SyncedLyrics */}
    </div>
  )
}
