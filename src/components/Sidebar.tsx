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
  public: boolean
  tracks: { total: number }
}

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { isAuthenticated, getToken } = useAuth()
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([])
  const [playlistsLoading, setPlaylistsLoading] = useState(false)

  // Fetch user playlists when authenticated
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

        const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=20&offset=0", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Failed to fetch playlists")
        const data = await res.json()

        if (!cancelled) {
          setUserPlaylists(data.items || [])
        }
      } catch (err) {
        console.error("Failed to load playlists:", err)
      } finally {
        if (!cancelled) setPlaylistsLoading(false)
      }
    }

    fetchPlaylists()
    return () => { cancelled = true }
  }, [isAuthenticated, getToken])

  const displayPlaylists = isAuthenticated && userPlaylists.length > 0
    ? userPlaylists.map((pl) => ({
        href: `/playlist/${pl.id}`,
        label: pl.name,
      }))
    : defaultPlaylists

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-black text-white flex flex-col transition-all duration-300 flex-shrink-0 h-full`}
    >
      {/* Logo */}
      <div className="p-6 pb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>
        {!collapsed && <span className="font-bold text-xl tracking-tight">Spotify</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-zinc-400 hover:text-white transition-colors hidden md:block"
        >
          <svg className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 pb-4">
        <ul className="space-y-1">
          {[...navItems, ...(isAuthenticated ? [{ href: "/me/top", label: "Top Charts", icon: TopChartIcon }] : [])].map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Library section */}
      {!collapsed && (
        <>
          {/* Library header */}
          <div className="px-6 py-2 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-zinc-600" />
            <div className="w-1 h-1 rounded-full bg-zinc-600" />
            <div className="w-1 h-1 rounded-full bg-zinc-600" />
            <span className="ml-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {isAuthenticated ? "Your Library" : "Playlists"}
            </span>
          </div>

          {/* Playlist actions (only when logged in) */}
          {isAuthenticated && (
            <div className="px-3 mb-2">
              <Link
                href="/search"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <div className="w-6 h-6 bg-zinc-700 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm">Create Playlist</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-sm">Liked Songs</span>
              </Link>
            </div>
          )}

          {/* Divider */}
          <div className="mx-6 my-1 border-t border-white/5" />

          {/* Playlist list */}
          <nav className="flex-1 px-3 overflow-y-auto scrollbar-thin">
            {playlistsLoading ? (
              <div className="space-y-1 px-3 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-zinc-800/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <ul className="space-y-0.5">
                {displayPlaylists.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 truncate ${
                        pathname === item.href
                          ? "bg-white/10 text-white font-medium"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>

          {/* User info footer when logged in */}
          {isAuthenticated && (
            <div className="px-3 py-3 border-t border-white/5 mt-auto">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500">
                <span>Showing {userPlaylists.length} playlists</span>
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function TopChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}
