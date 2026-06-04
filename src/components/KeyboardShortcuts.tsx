"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { usePlayer } from "./Player"

const SHORTCUTS = [
  { key: "Space", desc: "Play / Pause" },
  { key: "→", desc: "Next track" },
  { key: "←", desc: "Previous track" },
  { key: "H", desc: "Go to Home" },
  { key: "S", desc: "Go to Search" },
  { key: "Ctrl+K", desc: "Open Search" },
  { key: "?", desc: "Show this help" },
  { key: "Esc", desc: "Close modal" },
]

export default function KeyboardShortcuts() {
  const { togglePlay, currentTrack, nextTrack, prevTrack } = usePlayer()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const toggleRef = useRef(togglePlay); toggleRef.current = togglePlay
  const nextRef = useRef(nextTrack); nextRef.current = nextTrack
  const prevRef = useRef(prevTrack); prevRef.current = prevTrack
  const currentRef = useRef(currentTrack); currentRef.current = currentTrack
  const routerRef = useRef(router); routerRef.current = router
  const showModalRef = useRef(showModal); showModalRef.current = showModal

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" ||
        target.isContentEditable || !!target.closest("button, a, [role='button'], select")

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); routerRef.current.push("/search"); return
      }
      if (e.key === "Escape") { setShowModal(false); return }
      if (isInput) return

      switch (e.key) {
        case " ": e.preventDefault(); if (currentRef.current) toggleRef.current(); break
        case "ArrowRight": if (currentRef.current) { e.preventDefault(); nextRef.current() } break
        case "ArrowLeft": if (currentRef.current) { e.preventDefault(); prevRef.current() } break
        case "h": case "H": routerRef.current.push("/"); break
        case "s": case "S": routerRef.current.push("/search"); break
        case "?": setShowModal(v => !v); break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (!showModal) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border)] w-80 p-6 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[var(--text-primary)]">Keyboard Shortcuts</h2>
          <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">{s.desc}</span>
              <kbd className="px-2 py-0.5 text-xs font-mono bg-[var(--bg-hover)] text-[var(--text-primary)] rounded border border-[var(--border)]">{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
