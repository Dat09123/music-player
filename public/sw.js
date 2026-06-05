const CACHE_NAME = "muse-cache-v2"
const STATIC_CACHE = "muse-static-v2"
const API_CACHE = "muse-api-v2"
const IMAGE_CACHE = "muse-images-v2"

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/offline.html",
]

// ─── Install ─────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Non-critical — assets still load from network
      })
    })
  )
  // Activate immediately — don't wait for page refresh
  self.skipWaiting()
})

// ─── Activate: clean old caches ──────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (k) =>
              k !== STATIC_CACHE && k !== API_CACHE && k !== IMAGE_CACHE && k !== CACHE_NAME
          )
          .map((k) => caches.delete(k))
      )
    )
  )
  // Take control of all clients immediately
  self.clients.claim()
})

// ─── Helpers ─────────────────────────────────────────────
function isDeezerApi(url) {
  return url.includes("/api/deezer")
}

function isLyricsApi(url) {
  return url.includes("/api/lyrics")
}

function isWikiApi(url) {
  return url.includes("/api/wiki")
}

function isExternalImage(url) {
  return (
    url.includes("dzcdn.net") ||
    url.includes("scdn.co") ||
    url.includes("deezer.com")
  )
}

function isNavigation(url) {
  try {
    const reqUrl = new URL(url)
    return reqUrl.origin === self.location.origin && reqUrl.pathname !== "/sw.js"
  } catch {
    return false
  }
}

function isNextJsAsset(url) {
  return (
    url.includes("/_next/static/") ||
    url.endsWith(".js") ||
    url.endsWith(".css") ||
    url.endsWith(".ico") ||
    url.endsWith(".png") ||
    url.endsWith(".svg") ||
    url.endsWith(".json")
  )
}

// ─── Stale-while-revalidate for API calls ────────────────
async function staleWhileRevalidate(request, cacheName, maxAge = 5 * 60 * 1000) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  // Return cached response immediately if fresh
  if (cached) {
    const cachedTime = new Date(cached.headers.get("sw-cache-time") || 0).getTime()
    const isFresh = Date.now() - cachedTime < maxAge

    if (isFresh) {
      // Still fetch in background to keep cache warm
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const headers = new Headers(response.headers)
            headers.set("sw-cache-time", new Date().toISOString())
            cache.put(request, new Response(response.body, { status: response.status, statusText: response.statusText, headers }))
          }
        })
        .catch(() => {})
      return cached
    }
  }

  // Cache miss or stale — fetch from network
  try {
    const response = await fetch(request)
    if (response.ok) {
      const headers = new Headers(response.headers)
      headers.set("sw-cache-time", new Date().toISOString())
      cache.put(request, new Response(response.body, { status: response.status, statusText: response.statusText, headers }))
    }
    return response
  } catch (err) {
    // Network failed — return cached even if stale
    if (cached) return cached
    throw err
  }
}

// ─── Cache-first for external images ─────────────────────
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    if (cached) return cached
    throw err
  }
}

// ─── Network-first for navigation ────────────────────────
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    const cached = await cache.match(request)
    if (cached) return cached
    // Return offline fallback
    const fallback = await caches.match("/offline.html")
    if (fallback) return fallback
    // Last resort: return home page
    return (await caches.match("/")) || new Response("Offline", { status: 503 })
  }
}

// ─── Fetch ───────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = request.url

  // Skip non-GET
  if (request.method !== "GET") return

  // Skip service worker itself
  if (url.includes("/sw.js")) return

  // ── API requests ──
  if (isDeezerApi(url)) {
    // Deezer API: stale-while-revalidate, cache 5 min
    event.respondWith(staleWhileRevalidate(request, API_CACHE, 5 * 60 * 1000))
    return
  }

  if (isLyricsApi(url)) {
    // Lyrics: cache longer (they rarely change)
    event.respondWith(staleWhileRevalidate(request, API_CACHE, 30 * 60 * 1000))
    return
  }

  if (isWikiApi(url)) {
    // Wikipedia: cache very long (artist bios rarely change)
    event.respondWith(staleWhileRevalidate(request, API_CACHE, 24 * 60 * 60 * 1000))
    return
  }

  // ── External images (Deezer CDN, Spotify CDN) ──
  if (isExternalImage(url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  // ── Next.js static assets (versioned, cache forever) ──
  if (isNextJsAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // ── Navigation requests (HTML pages) ──
  if (isNavigation(url)) {
    event.respondWith(networkFirst(request, STATIC_CACHE))
    return
  }
})
