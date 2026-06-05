"use client"

import { useState, useEffect, useCallback } from "react"
import { processQueue, getQueueCount, clearQueue, onRetryComplete } from "@/lib/offline-queue"

export default function OfflineRetryHandler() {
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null)

  // Auto-process queue when coming online or after page load
  const runQueue = useCallback(async () => {
    const count = getQueueCount()
    if (count === 0) return

    const succeeded = await processQueue()
    if (succeeded > 0) {
      setToast({ message: `Connection restored — ${succeeded} item${succeeded > 1 ? "s" : ""} refreshed`, key: Date.now() })
    }
  }, [])

  // Process when coming online
  useEffect(() => {
    const handleOnline = () => runQueue()
    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [runQueue])

  // Process on mount (if there are queued items and we're online)
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.onLine) {
      runQueue()
    }
  }, [runQueue])

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast?.key])

  return (
    <>
      {toast && (
        <div
          key={toast.key}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
        >
          <div className="flex items-center gap-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-md text-sm">
            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[var(--text-secondary)]">{toast.message}</span>
            <button
              onClick={() => { clearQueue(); setToast(null) }}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-0.5"
              aria-label="Dismiss"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
