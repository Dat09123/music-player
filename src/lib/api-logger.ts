/**
 * API Error Logger
 * Persists Deezer API failures to localStorage so you can track issues over time.
 */

const STORAGE_KEY = "muse-api-logs"
const MAX_ENTRIES = 100

export interface ApiLogEntry {
  id: string
  timestamp: number
  endpoint: string
  errorType: "network" | "timeout" | "abort" | "http" | "unknown"
  status?: number
  message: string
  online: boolean
  attempt: number
}

function getLogs(): ApiLogEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLogs(logs: ApiLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  } catch {
    // localStorage full — silently fail
  }
}

/** Generate a short unique ID for each log entry */
function shortId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/** Classify the error type from a caught exception */
function classifyError(err: unknown, status?: number): ApiLogEntry["errorType"] {
  if (status) return "http"
  if (err instanceof DOMException) {
    if (err.name === "TimeoutError") return "timeout"
    if (err.name === "AbortError") return "abort"
  }
  if (err instanceof TypeError) return "network"
  return "unknown"
}

/**
 * Log an API error to localStorage.
 * Automatically trims to MAX_ENTRIES (newest kept).
 */
export function logApiError(
  endpoint: string,
  err: unknown,
  attempt: number,
  status?: number,
): void {
  const logs = getLogs()
  const entry: ApiLogEntry = {
    id: shortId(),
    timestamp: Date.now(),
    endpoint,
    errorType: classifyError(err, status),
    status,
    message: err instanceof Error ? err.message : String(err),
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    attempt,
  }
  logs.push(entry)

  // Trim to max entries (keep newest)
  if (logs.length > MAX_ENTRIES) {
    logs.splice(0, logs.length - MAX_ENTRIES)
  }

  saveLogs(logs)
}

/** Retrieve all logged API errors, newest first */
export function getApiLogs(): ApiLogEntry[] {
  return getLogs().reverse()
}

/** Clear all stored API error logs */
export function clearApiLogs(): void {
  saveLogs([])
}

/** Get a summary count of errors by type */
export function getApiLogSummary(): Record<string, number> {
  const logs = getLogs()
  const summary: Record<string, number> = {}
  for (const log of logs) {
    summary[log.errorType] = (summary[log.errorType] || 0) + 1
  }
  return summary
}
