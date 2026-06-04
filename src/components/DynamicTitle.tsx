"use client"

import { useEffect } from "react"
import { usePlayer } from "./Player"

export default function DynamicTitle() {
  const { currentTrack, isPlaying } = usePlayer()

  useEffect(() => {
    if (currentTrack) {
      document.title = `${isPlaying ? "▶" : "⏸"} ${currentTrack.name} — ${currentTrack.artists} · Muse`
    } else {
      document.title = "Muse - Listen to music"
    }
  }, [currentTrack, isPlaying])

  return null
}
