"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { usePlayer } from "./Player"

export default function KeyboardShortcuts() {
  const { togglePlay, currentTrack, nextTrack, prevTrack } = usePlayer()
  const router = useRouter()

  // Use refs to avoid re-attaching the listener on every render
  const toggleRef = useRef(togglePlay)
  toggleRef.current = togglePlay
  const nextRef = useRef(nextTrack)
  nextRef.current = nextTrack
  const prevRef = useRef(prevTrack)
  prevRef.current = prevTrack
  const currentRef = useRef(currentTrack)
  currentRef.current = currentTrack
  const routerRef = useRef(router)
  routerRef.current = router

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        !!target.closest("button, a, [role=\"button\"], select")

      // Ctrl+K / Cmd+K → search (always works, even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        routerRef.current.push("/search")
        return
      }

      // Skip if user is interacting with input/button
      if (isInput) return

      switch (e.key) {
        case " ":
          e.preventDefault()
          if (currentRef.current) toggleRef.current()
          break
        case "ArrowRight":
          if (currentRef.current) { e.preventDefault(); nextRef.current() }
          break
        case "ArrowLeft":
          if (currentRef.current) { e.preventDefault(); prevRef.current() }
          break
        case "h":
        case "H":
          routerRef.current.push("/")
          break
        case "s":
        case "S":
          routerRef.current.push("/search")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return null
}
