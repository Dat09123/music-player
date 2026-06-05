"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getApiLogs, clearApiLogs, getApiLogSummary, type ApiLogEntry } from "@/lib/api-logger"
import { getTimeAgo } from "@/lib/utils"
import { WarningIcon, ChevronLeftIcon, EmptyMusicIcon } from "@/components/Icons"

const errorColors: Record<string, string> = {
  network: "text-red-400 bg-red-50 dark:bg-red-950/30",
  timeout: "text-amber-400 bg-amber-50 dark:bg-amber-950/30",
  abort: "text-gray-400 bg-gray-50 dark:bg-gray-800",
  http: "text-orange-400 bg-orange-50 dark:bg-orange-950/30",
  unknown: "text-zinc-400 bg-zinc-50 dark:bg-zinc-800",
}

const errorLabels: Record<string, string> = {
  network: "Network",
  timeout: "Timeout",
  abort: "Aborted",
  http: "HTTP",
  unknown: "Unknown",
}

export default function DebugLogsPage() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({})

  function refresh() {
    setLogs(getApiLogs())
    setSummary(getApiLogSummary())
  }

  useEffect(refresh, [])

  function handleClear() {
    clearApiLogs()
    refresh()
  }

  return (
    <div className="p-6 pb-20 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-2"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
            Back to home
          </Link>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">API Error Logs</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Last {logs.length} errors recorded
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="text-xs font-medium text-[var(--accent)] hover:underline transition-all"
          >
            Refresh
          </button>
          {logs.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs font-medium text-red-400 hover:text-red-300 transition-all"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Summary badges */}
      {Object.keys(summary).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(summary).map(([type, count]) => (
            <span
              key={type}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                errorColors[type] || errorColors.unknown
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {errorLabels[type] || type}
              <span className="opacity-60">{count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Log list */}
      {logs.length > 0 ? (
        <div className="space-y-2">
          {logs.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border)] text-sm"
            >
              {/* Type badge */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  errorColors[entry.errorType] || errorColors.unknown
                }`}
              >
                {entry.errorType === "network" ? "N" :
                 entry.errorType === "timeout" ? "T" :
                 entry.errorType === "http" ? String(entry.status || "?") :
                 entry.errorType === "abort" ? "A" : "?"}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--text-primary)] truncate">
                    {entry.endpoint}
                  </span>
                  {entry.online !== undefined && !entry.online && (
                    <span className="text-[10px] font-medium text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded uppercase">
                      Offline
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                  {entry.message}
                </p>
              </div>

              {/* Time */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs tabular-nums text-[var(--text-muted)]">
                  {getTimeAgo(entry.timestamp)}
                </p>
                {entry.attempt > 0 && (
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Attempt {entry.attempt + 1}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
          <EmptyMusicIcon className="w-16 h-16 mb-4 opacity-30" strokeWidth={1} />
          <p className="text-lg font-medium text-[var(--text-primary)] mb-1">No errors logged</p>
          <p className="text-sm">Deezer API errors will appear here automatically</p>
        </div>
      )}
    </div>
  )
}
