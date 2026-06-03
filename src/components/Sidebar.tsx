"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
]

const defaultPlaylists = [
  { href: "/playlist/37i9dQZF1DXcBWIGoYBM5M", label: "Today's Top Hits" },
  { href: "/playlist/37i9dQZF1DX4WYpdgoIcn6", label: "Chill Hits" },
  { href: "/playlist/37i9dQZEVXbMDoHDwVN2tF", label: "Global Top 50" },
  { href: "/playlist/37i9dQZF1DXb68C5tFkNCv", label: "Rock Classics" },
  { href: "/playlist/37i9dQZF1DX7XfRr4cbTRr", label: "RapCaviar" },
]

interface UserPlaylist {
  id: string
  name: string
  images: { url: string }[]
  tracks: { total: number }
}

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { isAuthenticated, getToken } = useAuth()
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([])
  const [playlistsLoading, setPlaylistsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setUserPlaylists([])
      return
    }
    let cancelled = false
    setPlaylistsLoading(true)
    async function fetchPlaylists() {
      try {
        const token = await getToken()
        if (!token || cancelled) return
        const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=20", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed")
        const data = await res.json()
        if (!cancelled) setUserPlaylists(data.items || [])
      } catch { /* ignore */ }
      finally { if (!cancelled) setPlaylistsLoading(false) }
    }
    fetchPlaylists()
    return () => { cancelled = true }
  }, [isAuthenticated, getToken])

  const displayPlaylists = isAuthenticated && userPlaylists.length > 0
    ? userPlaylists.map((pl) => ({ href: `/playlist/${pl.id}`, label: pl.name }))
    : defaultPlaylists

  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} bg-white text-[var(--text-primary)] flex flex-col transition-all duration-300 flex-shrink-0 h-full border-r border-[var(--border)]`}>
      {/* Logo */}
      <div className="p-5 pb-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
        </div>
        {!collapsed && <span className="font-bold text-lg tracking-tight">Muse</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors hidden md:block">
          <svg className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 pb-3">
        <ul className="space-y-0.5">
          {[...navItems, ...(isAuthenticated ? [{ href: "/me/top", label: "Top Charts", icon: TopChartIcon }] : [])].map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${isActive ? "bg-[var(--accent-light)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`}>
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[var(--accent)]" : ""}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Library */}
      {!collapsed && <>
        <div className="px-5 py-2 flex items-center gap-2 border-t border-[var(--border)]">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            {isAuthenticated ? "Your Library" : "Playlists"}
          </span>
        </div>

        {isAuthenticated && (
          <div className="px-2 mb-1">
            <Link href="/me/liked" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${pathname === "/me/liked" ? "bg-[var(--accent-light)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`}>
              <div className="w-5 h-5 rounded bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              Liked Songs
            </Link>
          </div>
        )}

        <nav className="flex-1 px-2 overflow-y-auto">
          {playlistsLoading ? (
            <div className="space-y-1 px-3 py-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-7 bg-gray-100 rounded-lg skeleton" />)}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {displayPlaylists.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`block px-3 py-1.5 rounded-lg text-sm truncate transition-all ${pathname === item.href ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </>}
    </aside>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
}

function SearchIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
}

function TopChartIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
}
