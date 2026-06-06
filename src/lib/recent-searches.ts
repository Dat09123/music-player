"use client"

const STORAGE_KEY = "muse-recent-searches"
const MAX_ITEMS = 8

function loadAll(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(items: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function getRecentSearches(): string[] {
  return loadAll()
}

export function addRecentSearch(query: string): void {
  if (!query.trim()) return
  const items = loadAll().filter((s) => s !== query.trim())
  items.unshift(query.trim())
  saveAll(items.slice(0, MAX_ITEMS))
}

export function removeRecentSearch(query: string): void {
  const items = loadAll().filter((s) => s !== query)
  saveAll(items)
}

export function clearRecentSearches(): void {
  saveAll([])
}
