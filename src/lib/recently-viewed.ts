"use client"

export type ViewedPageType = "artist" | "album" | "playlist" | "track"

export interface RecentlyViewedItem {
  id: string
  type: ViewedPageType
  name: string
  imageUrl: string
  subtext?: string
  viewedAt: number
  href: string
}

const STORAGE_KEY = "muse-recently-viewed"
const MAX_ITEMS = 20

function loadAll(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(items: RecentlyViewedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage full or unavailable
  }
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  return loadAll()
}

export function trackPageView(item: Omit<RecentlyViewedItem, "viewedAt">): void {
  const items = loadAll()
  // Remove existing entry with same id+type
  const filtered = items.filter((i) => !(i.id === item.id && i.type === item.type))
  // Add to front
  filtered.unshift({ ...item, viewedAt: Date.now() })
  // Trim
  saveAll(filtered.slice(0, MAX_ITEMS))
}

export function clearRecentlyViewed(): void {
  saveAll([])
}
