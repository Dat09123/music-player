"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { usePlayer } from "./Player"
import { fetchLyrics, getCurrentLineIndex, type LyricLine, type LyricsResult } from "@/lib/lyrics"
import { MusicNoteIcon } from "@/components/Icons"

function LyricsView({ lines, currentIndex, progress }: { lines: LyricLine[]; currentIndex: number; progress: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])

  // Auto-scroll to current line
  useEffect(() => {
    if (currentIndex < 0 || !containerRef.current) return
    const el = lineRefs.current[currentIndex]
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [currentIndex])

  if (lines.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto scrollbar-none px-4 py-8 space-y-3"
      style={{ scrollBehavior: "smooth" }}
    >
      {lines.map((line, i) => {
        const isCurrent = i === currentIndex
        const isPast = i < currentIndex

        // Calculate karaoke progress for the current line
        let karaokePercent = 0
        if (isCurrent && currentIndex >= 0) {
          const currentLine = lines[currentIndex]
          const nextLine = lines[currentIndex + 1]
          if (nextLine) {
            const duration = nextLine.time - currentLine.time
            if (duration > 0) {
              karaokePercent = Math.min(1, Math.max(0, (progress - currentLine.time) / duration))
            }
          } else {
            karaokePercent = 1
          }
        }

        return (
          <div
            key={i}
            ref={(el) => { lineRefs.current[i] = el }}
            className={`transition-all duration-300 text-center leading-relaxed ${
              isCurrent
                ? "text-white scale-110 font-bold"
                : isPast
                  ? "text-white/20 text-sm"
                  : "text-white/40 text-sm"
            }`}
          >
            {isCurrent && karaokePercent > 0 && karaokePercent < 1 ? (
              <span className="relative inline">
                <span className="text-white/20">{line.text}</span>
                <span
                  className="absolute inset-0 overflow-hidden whitespace-nowrap"
                  style={{ width: `${karaokePercent * 100}%` }}
                >
                  <span className="text-white">{line.text}</span>
                </span>
              </span>
            ) : (
              <span>{line.text}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PlainLyricsView({ text }: { text: string }) {
  return (
    <div className="h-full overflow-y-auto scrollbar-none px-6 py-8">
      <p className="text-white/40 text-sm leading-relaxed whitespace-pre-line text-center select-none">
        {text}
      </p>
    </div>
  )
}

export default function LyricsDisplay() {
  const { currentTrack, progress } = usePlayer()
  const [result, setResult] = useState<LyricsResult>({ synced: [], plain: null, source: null })
  const [loading, setLoading] = useState(false)
  const fetchIdRef = useRef(0)
  const trackRef = useRef<string | null>(null)

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!currentTrack || !currentTrack.name) {
      setResult({ synced: [], plain: null, source: null })
      return
    }

    const key = `${currentTrack.id || ""}-${currentTrack.name}`
    if (trackRef.current === key) return
    trackRef.current = key

    const thisFetch = ++fetchIdRef.current

    setLoading(true)
    setResult({ synced: [], plain: null, source: null })

    fetchLyrics(currentTrack.artists || "", currentTrack.name).then((res) => {
      // Only apply result if this is still the latest fetch
      if (fetchIdRef.current !== thisFetch) return
      setResult(res)
      setLoading(false)
    })
  }, [currentTrack?.id, currentTrack?.name, currentTrack?.artists])

  const currentIndex = result.source === "synced" && result.synced.length > 0
    ? getCurrentLineIndex(result.synced, progress)
    : -1

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </span>
        <span className="text-xs">Loading lyrics...</span>
      </div>
    )
  }

  // No lyrics found
  if (!result.source) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-white/10 select-none">
        <MusicNoteIcon className="w-8 h-8" />
        <p className="text-xs">No lyrics available</p>
      </div>
    )
  }

  // Plain lyrics fallback
  if (result.source === "plain" && result.plain) {
    return <PlainLyricsView text={result.plain} />
  }

  // Synced lyrics
  return <LyricsView lines={result.synced} currentIndex={currentIndex} progress={progress} />
}
