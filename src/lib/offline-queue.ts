/**
 * Offline Retry Queue
 * Persists failed API requests and replays them when the connection is restored.
 */

import { clearApiCache } from "./data-cache"

const STORAGE_KEY = "muse-offline-queue"
const MAX_ENTRIES = 20

export interface QueuedRequest {
  path: string
  timestamp: number
  retries: number
}

// ─── Retry-complete event ────────────────────────────────

type RetrySubscriber = (path: string) => void
let retrySubscribers: RetrySubscriber[] = []

/** Subscribe to retry-complete events. Returns unsubscribe function. */
export function onRetryComplete(cb: RetrySubscriber): () => void {
  retrySubscribers.push(cb)
  return () => { retrySubscribers = retrySubscribers.filter((s) => s !== cb) }
}

function notifyRetryComplete(path: string): void {
  retrySubscribers.forEach((cb) => cb(path))
}

// ─── Queue management ────────────────────────────────────

function getQueue(): QueuedRequest[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveQueue(queue: QueuedRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  } catch {
    // localStorage full — silently fail
  }
}

/** Add a failed request to the retry queue (deduplicated by path). */
export function enqueueRetry(path: string): void {
  const queue = getQueue()

  // Deduplicate: if already queued, just update timestamp
  const existing = queue.find((q) => q.path === path)
  if (existing) {
    existing.timestamp = Date.now()
    existing.retries += 1
  } else {
    queue.push({ path, timestamp: Date.now(), retries: 0 })
  }

  // Trim oldest entry if over max
  if (queue.length > MAX_ENTRIES) {
    queue.sort((a, b) => a.timestamp - b.timestamp)
    queue.splice(0, queue.length - MAX_ENTRIES)
  }

  saveQueue(queue)
}

/** Remove a completed/cleared request from the queue. */
function dequeue(path: string): void {
  const queue = getQueue().filter((q) => q.path !== path)
  saveQueue(queue)
}

/** Get all queued request paths. */
export function getQueuedPaths(): string[] {
  return getQueue().map((q) => q.path)
}

/** Get count of queued requests. */
export function getQueueCount(): number {
  return getQueue().length
}

/** Clear all queued requests. */
export function clearQueue(): void {
  saveQueue([])
}

// ─── Processing ──────────────────────────────────────────

/**
 * Process the retry queue: re-fetch each queued path via the API proxy.
 * Returns the number of successfully re-fetched items.
 */
export async function processQueue(): Promise<number> {
  const queue = getQueue()
  if (queue.length === 0) return 0

  let successCount = 0

  for (const item of queue) {
    try {
      const res = await fetch(`/api/deezer${item.path}`, {
        signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
          ? AbortSignal.timeout(15000)
          : undefined,
      })

      if (res.ok) {
        dequeue(item.path)
        notifyRetryComplete(item.path)
        successCount++
        console.debug(`[OfflineQueue] ✅ Retry succeeded: ${item.path}`)
      } else {
        console.warn(`[OfflineQueue] ⚠ Retry failed (${res.status}): ${item.path}, will retry later`)
      }
    } catch (err) {
      console.warn(`[OfflineQueue] ⚠ Retry error: ${item.path}`, err)
      // Keep in queue for next retry attempt
    }
  }

  // Clear cache once after all retries so next page loads get fresh data
  if (successCount > 0) {
    clearApiCache()
  }

  return successCount
}
