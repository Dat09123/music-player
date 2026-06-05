"use client"

import { useState, useEffect } from "react"
import { onStaleData } from "@/lib/data-cache"

export default function StaleDataBanner() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [offline, setOffline] = useState(false)

  // Track online/offline state
  useEffect(() => {
    setOffline(typeof navigator !== "undefined" && !navigator.onLine)

    const goOffline = () => { setOffline(true); setShow(true) }
    const goOnline = () => { setOffline(false) }

    window.addEventListener("offline", goOffline)
    window.addEventListener("online", goOnline)
    return () => {
      window.removeEventListener("offline", goOffline)
      window.removeEventListener("online", goOnline)
    }
  }, [])

  // Subscribe to stale-data events from cache fallback
  useEffect(() => {
    const unsub = onStaleData(() => {
      if (!dismissed) setShow(true)
    })
    return unsub
  }, [dismissed])

  // Auto-hide after 8 seconds (only for online stale data)
  useEffect(() => {
    if (!show || offline) return
    const timer = setTimeout(() => setShow(false), 8000)
    return () => clearTimeout(timer)
  }, [show, offline])

  if (!show) return null

  return (
    <div className={`fixed z-50 animate-slide-down ${offline ? "top-10 left-0 right-0" : "bottom-20 md:bottom-6 left-1/2 -translate-x-1/2"}`}>
      <div
        className={`
          flex items-center gap-2.5 shadow-lg backdrop-blur-md text-sm
          ${offline
            ? "mx-4 rounded-xl bg-amber-500/90 dark:bg-amber-600/90 text-white px-4 py-3"
            : "bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5"
          }
        `}
      >
        {/* Icon */}
        {offline ? (
          <svg className="w-4 h-4 flex-shrink-0 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}

        <span className={offline ? "text-white/90" : "text-[var(--text-secondary)]"}>
          {offline
            ? "You're offline — showing cached data. Updates will resume when connection is back."
            : "Showing data from earlier — some info may be outdated"}
        </span>

        <button
          onClick={() => window.location.reload()}
          className={`text-xs font-medium whitespace-nowrap transition-all ${
            offline
              ? "text-white underline hover:no-underline"
              : "text-[var(--accent)] hover:underline"
          }`}
        >
          Retry
        </button>

        <button
          onClick={() => { setShow(false); setDismissed(true) }}
          className={`transition-colors p-0.5 ${
            offline ? "text-white/60 hover:text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
