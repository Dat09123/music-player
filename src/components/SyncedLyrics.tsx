"use client"

import { useRef, useEffect, useMemo } from "react"
import { usePlayer } from "./Player"

interface TimedLine {
  time: number // seconds
  text: string
}

interface Props {
  syncedLyrics: string
}

function parseLRC(lrc: string): TimedLine[] {
  const lines = lrc.split("\n")
  const result: TimedLine[] = []
  // Matches [mm:ss.xx] or [mm:ss.xxx] at the start of a line
  const lineRegex = /^\[(\d{1,3}):(\d{2})\.(\d{2,3})\](.*)$/

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const match = trimmed.match(lineRegex)
    if (match) {
      const minutes = parseInt(match[1], 10)
      const seconds = parseInt(match[2], 10)
      let millis = parseInt(match[3], 10)
      // If the timestamp has 2-digit millis, treat as centiseconds * 10
      if (match[3].length === 2) millis *= 10
      const time = minutes * 60 + seconds + millis / 1000
      const text = match[4].trim()
      if (text) result.push({ time, text })
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

export default function SyncedLyrics({ syncedLyrics }: Props) {
  const { progress, isPlaying } = usePlayer()
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([])

  const timedLines = useMemo(() => parseLRC(syncedLyrics), [syncedLyrics])

  // Find current line index
  const currentIndex = useMemo(() => {
    if (timedLines.length === 0) return -1
    // Find the last line whose time is <= current progress
    let idx = -1
    for (let i = 0; i < timedLines.length; i++) {
      if (timedLines[i].time <= progress) idx = i
      else break
    }
    return idx
  }, [timedLines, progress])

  // Auto-scroll to keep current line centered
  useEffect(() => {
    if (currentIndex < 0 || !containerRef.current) return
    const lineEl = lineRefs.current[currentIndex]
    if (!lineEl) return

    const container = containerRef.current
    const lineTop = lineEl.offsetTop
    const lineHeight = lineEl.offsetHeight
    const containerHeight = container.clientHeight

    container.scrollTo({
      top: lineTop - containerHeight / 2 + lineHeight / 2,
      behavior: "smooth",
    })
  }, [currentIndex])

  if (timedLines.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">No synced lyrics available</p>
      </div>
    )
  }

  // Calculate progress for current line (for the width animation)
  const currentLine = currentIndex >= 0 ? timedLines[currentIndex] : null
  const nextLine = currentIndex >= 0 && currentIndex < timedLines.length - 1 ? timedLines[currentIndex + 1] : null
  const lineProgress = currentLine && nextLine
    ? Math.max(0, Math.min((progress - currentLine.time) / (nextLine.time - currentLine.time), 1))
    : 0

  return (
    <div
      ref={containerRef}
      className={`relative ${cinemaMode ? "h-full max-h-[70vh]" : "h-[400px]"} overflow-y-auto scroll-smooth px-2 [&::-webkit-scrollbar]:hidden scrollbar-none`}
    >
      {/* Spacer top */}
      {!cinemaMode && <div className="h-[160px]" />}

      {timedLines.map((line, i) => {
        const isPast = i < currentIndex
        const isCurrent = i === currentIndex
        const isFuture = i > currentIndex

        return (
          <div key={i} className="relative mb-5">
            <p
              ref={(el) => { lineRefs.current[i] = el }}
              className={`${cinemaMode ? "text-2xl leading-[3rem]" : "text-lg leading-relaxed"} transition-all duration-300 ${
                isCurrent
                  ? "text-[var(--accent)] font-bold scale-105"
                  : isPast
                  ? "text-[var(--text-muted)]/40"
                  : "text-[var(--text-secondary)]/70"
              }`}
            >
              {line.text}
            </p>
            {/* Animated underline for current line */}
            {isCurrent && (
              <div className="absolute bottom-0 left-0 h-0.5 bg-[var(--accent)] rounded-full transition-all duration-150"
                style={{ width: `${lineProgress * 100}%` }}
              />
            )}
          </div>
        )
      })}

      {/* Spacer bottom */}
      {!cinemaMode && <div className="h-[160px]" />}

      {/* Pause indicator */}
      {!isPlaying && timedLines.length > 0 && (
        <div className="sticky bottom-4 flex items-center justify-center">
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm px-3 py-1 rounded-full border border-[var(--border)]">
            Paused
          </span>
        </div>
      )}
    </div>
  )
}
