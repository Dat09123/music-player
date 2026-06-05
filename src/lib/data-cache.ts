/**
 * Data Cache
 * Stores successful Deezer API responses in localStorage so stale data can be
 * shown as fallback when the API is unreachable.
 */

const STORAGE_KEY = "muse-data-cache"
const MAX_ENTRIES = 50
const DEFAULT_TTL = 30 * 60 * 1000 // 30 minutes

// ─── Stale data event pub/sub ────────────────────────────

type StaleSubscriber = (endpoint: string) => void
let staleSubscribers: StaleSubscriber[] = []

/** Subscribe to stale-data events. Returns unsubscribe function. */
export function onStaleData(cb: StaleSubscriber): () => void {
  staleSubscribers.push(cb)
  return () => { staleSubscribers = staleSubscribers.filter((s) => s !== cb) }
}

function notifyStaleData(endpoint: string): void {
  staleSubscribers.forEach((cb) => cb(endpoint))
}

// ─── Cache entry types ───────────────────────────────────

interface CacheStore {
  [key: string]: {
    data: unknown
    timestamp: number
    ttl: number
  }
}

// ─── Internal helpers ────────────────────────────────────

function getStore(): CacheStore {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStore(store: CacheStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage full — silently fail
  }
}

/** Trim cache to MAX_ENTRIES, removing oldest entries first */
function trimStore(store: CacheStore): void {
  const keys = Object.keys(store)
  if (keys.length <= MAX_ENTRIES) return
  const sorted = keys
    .map((k) => ({ key: k, ts: store[k].timestamp }))
    .sort((a, b) => a.ts - b.ts) // oldest first
  const toRemove = sorted.slice(0, keys.length - MAX_ENTRIES)
  for (const { key } of toRemove) {
    delete store[key]
  }
}

// ─── Public API ──────────────────────────────────────────

/**
 * Store a successful API response in the cache.
 * Call this after a successful fetch with the raw response data.
 */
export function cacheApiData(path: string, data: unknown, ttl = DEFAULT_TTL): void {
  const store = getStore()
  store[path] = {
    data,
    timestamp: Date.now(),
    ttl,
  }
  trimStore(store)
  saveStore(store)
}

/**
 * Retrieve cached data for a path. Returns `null` if no cache entry exists.
 * Optionally specify `ignoreTTL` to return expired entries too (for fallback).
 */
export function getCachedApiData<T>(path: string, ignoreTTL = false): T | null {
  const store = getStore()
  const entry = store[path]
  if (!entry) return null

  // If TTL expired and we're not ignoring it, treat as miss
  if (!ignoreTTL && Date.now() - entry.timestamp > entry.ttl) {
    return null
  }

  return entry.data as T
}

/**
 * Try to retrieve cached data for fallback (ignores TTL).
 * If found, triggers a stale-data notification.
 */
export function getFallbackData<T>(path: string): T | null {
  const data = getCachedApiData<T>(path, true)
  if (data !== null) {
    notifyStaleData(path)
  }
  return data
}

/** Clear all cached API data */
export function clearApiCache(): void {
  saveStore({})
}

/** Check if a cache entry exists and is still fresh */
export function hasFreshCache(path: string): boolean {
  return getCachedApiData(path, false) !== null
}
