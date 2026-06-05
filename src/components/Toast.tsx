"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react"
import { CheckIcon, XIcon, InfoIcon } from "@/components/Icons"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
  exiting?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType) => void
  dismissToast: (id: string) => void
}

const TOAST_DURATION = 2500

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t))
    // Remove from DOM after exit animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => dismissToast(id), TOAST_DURATION)
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-24 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((toast, index) => (
          <ToastItem key={toast.id} toast={toast} index={index} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, index, onDismiss }: { toast: Toast; index: number; onDismiss: (id: string) => void }) {
  const progressRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const startTimeRef = useRef<number>(Date.now())
  const pauseStartRef = useRef<number>(0)
  const remainingRef = useRef<number>(TOAST_DURATION)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-dismiss timer with pause/resume
  useEffect(() => {
    if (toast.exiting) return

    function startTimer(duration: number) {
      timerRef.current = setTimeout(() => onDismiss(toast.id), duration)
    }

    if (paused) {
      if (timerRef.current) clearTimeout(timerRef.current)
    } else {
      startTimer(remainingRef.current)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [paused, toast.exiting, toast.id, onDismiss])

  // Pause on hover, resume on leave
  function handleMouseEnter() {
    if (toast.exiting) return
    // Calculate actual remaining time before pause
    const elapsed = Date.now() - startTimeRef.current
    remainingRef.current = Math.max(0, TOAST_DURATION - elapsed)
    pauseStartRef.current = Date.now()
    setPaused(true)
  }

  function handleMouseLeave() {
    if (toast.exiting) return
    const pausedDuration = Date.now() - pauseStartRef.current
    remainingRef.current = Math.max(0, remainingRef.current - pausedDuration)
    // Reset start time for resume
    startTimeRef.current = Date.now()
    setPaused(false)
  }

  const isSuccess = toast.type === "success"
  const isError = toast.type === "error"

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-lg border backdrop-blur-xl max-w-sm w-full ${
        toast.exiting ? "animate-toast-out" : "animate-toast-in"
      } ${isSuccess ? "bg-green-50 dark:bg-green-950/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200" : isError ? "bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200" : "bg-[var(--bg-secondary)]/95 border-[var(--border)] text-[var(--text-primary)]"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onDismiss(toast.id)}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center ${
        isSuccess ? "bg-green-500/20" : isError ? "bg-red-500/20" : "bg-[var(--accent)]/20"
      }`}>
        {isSuccess ? (
          <CheckIcon className="w-3 h-3" strokeWidth={3} />
        ) : isError ? (
          <XIcon className="w-3 h-3" strokeWidth={3} />
        ) : (
          <InfoIcon className="w-3 h-3" strokeWidth={3} />
        )}
      </div>

      {/* Message */}
      <span className="text-sm font-medium flex-1 min-w-0">{toast.message}</span>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(toast.id) }}
        className="flex-shrink-0 p-0.5 rounded-md opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
        aria-label="Dismiss"
      >
        <XIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
      </button>

      {/* Progress bar */}
      {!toast.exiting && (
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden bg-black/5 dark:bg-white/5">
          <div
            ref={progressRef}
            className={`h-full rounded-b-xl animate-toast-progress ${
              isSuccess ? "bg-green-400 dark:bg-green-500" : isError ? "bg-red-400 dark:bg-red-500" : "bg-[var(--accent)]"
            }`}
            style={{ animationDuration: `${TOAST_DURATION}ms`, animationPlayState: paused ? "paused" : "running" }}
          />
        </div>
      )}
    </div>
  )
}
