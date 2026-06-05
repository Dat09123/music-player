"use client"

import { useState, useEffect } from "react"

interface SkeletonProps {
  variant?: "text" | "circle" | "card" | "rect" | "hero-image" | "hero-text"
  width?: string | number
  height?: string | number
  className?: string
  accent?: boolean
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  accent = false,
}: SkeletonProps) {
  const baseClass = accent ? "skeleton-accent" : "skeleton"

  if (variant === "text") {
    return (
      <div
        className={`${baseClass} rounded ${className}`}
        style={{
          width: typeof width === "number" ? `${width}px` : width || "100%",
          height: typeof height === "number" ? `${height}px` : height || "16px",
        }}
      />
    )
  }

  if (variant === "circle") {
    const size = typeof width === "number" ? `${width}px` : width || "48px"
    return (
      <div
        className={`${baseClass} rounded-full flex-shrink-0 ${className}`}
        style={{ width: size, height: typeof height === "number" ? `${height}px` : height || size }}
      />
    )
  }

  if (variant === "card") {
    return (
      <div className={`bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4 ${className}`}>
        <div className={`w-full aspect-square rounded-lg ${baseClass} mb-3`} />
        <div className={`h-4 w-3/4 ${baseClass} rounded mb-2`} />
        <div className={`h-3 w-1/2 ${baseClass} rounded`} />
      </div>
    )
  }

  if (variant === "hero-image") {
    return (
      <div
        className={`${baseClass} flex-shrink-0 shadow-2xl ${className}`}
        style={{
          width: typeof width === "number" ? `${width}px` : width || "200px",
          height: typeof height === "number" ? `${height}px` : height || "200px",
          borderRadius: "var(--radius-lg)",
        }}
      />
    )
  }

  if (variant === "hero-text") {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className={`h-4 w-20 ${baseClass} rounded`} />
        <div
          className={`${baseClass} rounded`}
          style={{
            width: typeof width === "number" ? `${width}px` : width || "250px",
            height: typeof height === "number" ? `${height}px` : height || "40px",
          }}
        />
        <div className={`h-4 w-48 ${baseClass} rounded`} />
      </div>
    )
  }

  // Default: rect
  return (
    <div
      className={`${baseClass} rounded-lg ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width || "100%",
        height: typeof height === "number" ? `${height}px` : height || "100%",
      }}
    />
  )
}

// ─── Retry / extended loading indicator ─────────────────

/** Fades in a subtle "Connecting..." indicator after a delay */
function DelayedLoadingIndicator() {
  const [phase, setPhase] = useState<"hidden" | "connecting" | "retrying">("hidden")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("connecting"), 1500)
    const t2 = setTimeout(() => setPhase("retrying"), 4000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (phase === "hidden") return null

  return (
    <div
      className={`flex flex-col items-center justify-center py-4 transition-all duration-500 ${
        phase === "connecting" ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="flex gap-0.5">
          <span
            className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "1s" }}
          />
          <span
            className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce"
            style={{ animationDelay: "200ms", animationDuration: "1s" }}
          />
          <span
            className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce"
            style={{ animationDelay: "400ms", animationDuration: "1s" }}
          />
        </span>
        <span className="tabular-nums">
          {phase === "retrying" ? "Still connecting, please wait…" : "Connecting…"}
        </span>
      </div>
    </div>
  )
}

/** Wraps skeleton content and shows a delayed loading indicator */
export function LoadingSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <DelayedLoadingIndicator />
    </div>
  )
}

// ─── TrackList loading skeleton (used by Playlist, Album, Artist clients) ─

export function TrackListSkeleton() {
  return (
    <div className="animate-pulse space-y-2 px-4">
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-7 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/5" />
            <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-2/5" />
          </div>
          <div className="w-8 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  )
}

// ─── Skeleton track row ──────────────────────────────────

export function SkeletonTrackRow({ count = 5, showImage = true }: { count?: number; showImage?: boolean }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-2">
          <Skeleton width={20} height={20} />
          {showImage && <Skeleton variant="circle" width={36} height={36} />}
          <div className="flex-1 min-w-0 space-y-1.5">
            <Skeleton width="75%" height={14} />
            <Skeleton width="50%" height={12} />
          </div>
          <Skeleton width={40} height={12} />
        </div>
      ))}
    </div>
  )
}

// ─── Skeleton card grid ──────────────────────────────────

export function SkeletonCardGrid({ count = 6, aspect = "square" }: { count?: number; aspect?: "square" | "circle" }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
          <div
            className={`w-full ${aspect === "circle" ? "aspect-square rounded-full" : "aspect-square rounded-lg"} skeleton mb-3`}
          />
          <Skeleton width="70%" height={14} className="mb-1" />
          <Skeleton width="50%" height={12} />
        </div>
      ))}
    </div>
  )
}

// ─── Skeleton hero ───────────────────────────────────────

export function SkeletonHero({
  variant = "default",
}: {
  variant?: "default" | "artist" | "playlist"
}) {
  if (variant === "artist") {
    return (
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-200/50 dark:from-gray-800/50 to-zinc-900">
        <div className="px-6 pt-20 pb-8 md:pt-28 md:pb-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <Skeleton variant="circle" width={200} height={200} className="ring-4 ring-white/10" />
            <div className="text-center md:text-left flex-1 space-y-3">
              <Skeleton width={64} height={16} />
              <Skeleton width={200} height={48} />
              <Skeleton width={128} height={16} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "playlist") {
    return (
      <div className="px-6 pt-12 pb-8 md:pt-20 md:pb-10 skeleton-pulse">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <Skeleton variant="hero-image" width={200} height={200} />
          <div className="text-center md:text-left flex-1 space-y-3">
            <Skeleton width={64} height={16} />
            <Skeleton width={250} height={40} />
            <Skeleton width={200} height={16} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-gray-200/50 dark:from-gray-800/50 to-zinc-900">
      <div className="px-6 pt-20 pb-8 md:pt-28 md:pb-12">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <Skeleton variant="hero-image" width={200} height={200} className="ring-4 ring-white/10" />
          <div className="text-center md:text-left flex-1 space-y-3">
            <Skeleton width={64} height={16} />
            <Skeleton width={250} height={48} />
            <Skeleton width={200} height={16} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton for lyrics loading state ───────────────────

export function SkeletonLyrics() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-4">
        <span className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </span>
        <span>Loading lyrics...</span>
      </div>
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} width={i % 2 === 0 ? "70%" : "60%"} height={16} accent />
      ))}
    </div>
  )
}
