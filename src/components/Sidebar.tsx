"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { getPlaylists, createPlaylist } from "@/lib/playlists"
import type { LocalPlaylist } from "@/lib/types"
import { useSidebar } from "./SidebarContext"

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/me/top", label: "Top Charts", icon: TopChartIcon },
  { href: "/me/liked", label: "Trending Now", icon: TrendingIcon },
]

const deezerPlaylists = [
  { href: "/playlist/3155776842", label: "Pop Hits" },
  { href: "/playlist/3155776762", label: "Rock Classics" },
  { href: "/playlist/1111149871", label: "Electronic" },
  { href: "/playlist/1162338821", label: "Chill Zone" },
  { href: "/playlist/1036511661", label: "Hip Hop" },
]

function SidebarContent({
  localPlaylists,
  collapsed,
  onClose,
  onCreatePlaylist,
}: {
  localPlaylists: LocalPlaylist[]
  collapsed?: boolean
  onClose?: () => void
  onCreatePlaylist?: () => void
}) {
  const pathname = usePathname()

  function isLocalPlaylistActive(id: string) {
    return pathname === `/playlist/local/${id}`
  }

  return (
    <>
      {/* Nav */}
      <nav className="px-2 pb-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link href={item.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${isActive ? "bg-[var(--accent-light)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`}>
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[var(--accent)]" : ""}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Playlists section */}
      {(!collapsed) && (
        <>
          {localPlaylists.length > 0 && (
            <>
              <div className="px-5 py-2 border-t border-[var(--border)]">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Your Playlists</span>
              </div>
              <nav className="px-2 overflow-y-auto max-h-40">
                <ul className="space-y-0.5">
                  {localPlaylists.map((pl) => (
                    <li key={pl.id}>
                      <Link href={`/playlist/local/${pl.id}`} onClick={onClose} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm truncate transition-all ${isLocalPlaylistActive(pl.id) ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`}>
                        <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                        <span className="truncate">{pl.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          )}

          <div className="px-5 py-2 border-t border-[var(--border)]">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Deezer Charts</span>
          </div>
          <nav className="flex-1 px-2 overflow-y-auto">
            <ul className="space-y-0.5">
              {deezerPlaylists.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={onClose} className={`block px-3 py-1.5 rounded-lg text-sm truncate transition-all ${pathname === item.href ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-2 py-2 border-t border-[var(--border)]">
            <button onClick={onCreatePlaylist} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              <span>New Playlist</span>
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { mobileOpen, setMobileOpen } = useSidebar()
  const [collapsed, setCollapsed] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [playlistName, setPlaylistName] = useState("")
  const [localPlaylists, setLocalPlaylists] = useState<LocalPlaylist[]>([])
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)

  function refreshPlaylists() {
    setLocalPlaylists(getPlaylists())
  }

  useEffect(() => { refreshPlaylists() }, [])

  useEffect(() => {
    if (showCreateModal && inputRef) {
      setTimeout(() => inputRef.focus(), 100)
    }
  }, [showCreateModal, inputRef])

  function handleCreate() {
    if (!playlistName.trim()) return
    createPlaylist({ name: playlistName.trim() })
    setPlaylistName("")
    setShowCreateModal(false)
    refreshPlaylists()
  }

  // Close mobile sidebar on navigation
  useEffect(() => { setMobileOpen(false) }, [pathname, setMobileOpen])

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${collapsed ? "w-16" : "w-64"} bg-[var(--bg-secondary)] text-[var(--text-primary)] flex-col transition-all duration-300 flex-shrink-0 h-full border-r border-[var(--border)]`}>
        <div className="p-5 pb-3 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm hover:opacity-90 transition-all">
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </Link>
          {!collapsed && <span className="font-bold text-lg tracking-tight">Muse</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all hidden md:block cursor-pointer" title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <svg className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <SidebarContent localPlaylists={localPlaylists} collapsed={collapsed} onCreatePlaylist={() => setShowCreateModal(true)} />
      </aside>

      {/* Mobile sidebar (overlay drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex md:hidden w-72 bg-[var(--bg-secondary)] text-[var(--text-primary)] flex-col transition-all duration-300 h-full border-r border-[var(--border)] shadow-2xl ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 pb-3">
          <Link href="/" className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </Link>
          <span className="font-bold text-lg tracking-tight mr-auto ml-3">Muse</span>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SidebarContent localPlaylists={localPlaylists} collapsed={false} onClose={() => setMobileOpen(false)} onCreatePlaylist={() => { setShowCreateModal(true); setMobileOpen(false) }} />
      </aside>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); setPlaylistName("") }}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl border border-[var(--border)] w-80 p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Create Playlist</h3>
            <input
              ref={(el) => setInputRef(el)}
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setShowCreateModal(false); setPlaylistName("") } }}
              placeholder="My Awesome Playlist"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
              maxLength={100}
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => { setShowCreateModal(false); setPlaylistName("") }} className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">Cancel</button>
              <button onClick={handleCreate} disabled={!playlistName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:opacity-90 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
            </div>
          </div>
        </div>
      )}
    </>
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

function TrendingIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
}
