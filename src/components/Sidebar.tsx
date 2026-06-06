"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, memo } from "react"
import dynamic from "next/dynamic"
import { getPlaylists } from "@/lib/playlists"
import type { LocalPlaylist } from "@/lib/types"
import { useSidebar } from "./SidebarContext"
import { useTheme, ACCENT_COLORS } from "@/lib/ThemeContext"
import {
  HomeIcon, SearchIcon, ClockIcon, PersonIcon, MusicNoteIcon,
  ChartIcon, PlusIcon, MusicNoteStrokeIcon, CollapseIcon,
  XIcon, MoonIcon, SunIcon, PlayCircleIcon, HeartIcon,
} from "@/components/Icons"
import { useConnectionQuality } from "@/hooks/useConnectionQuality"
import { qualityLabel, qualityColor, qualityBars } from "@/lib/connection"

const CreatePlaylistModal = dynamic(() => import("./CreatePlaylistModal"), { ssr: false })

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/now-playing", label: "Now Playing", icon: PlayCircleIcon },
  { href: "/stations", label: "Stations", icon: MusicNoteIcon },
  { href: "/me/recently", label: "Recently Played", icon: ClockIcon },
  { href: "/me/artist-history", label: "Artist History", icon: PersonIcon },
  { href: "/me/album-history", label: "Album History", icon: MusicNoteIcon },
  { href: "/me/top", label: "Top Charts", icon: ChartIcon },
  { href: "/me/liked", label: "Liked Songs", icon: HeartIcon },
]

const deezerPlaylists = [
  { href: "/playlist/1363560485", label: "Pop Hits" },
  { href: "/playlist/1422391945", label: "Rock Classics" },
  { href: "/playlist/1902101402", label: "Electronic" },
  { href: "/playlist/1925105902", label: "Chill Vibes" },
  { href: "/playlist/1677006641", label: "Hip Hop" },
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
      <nav aria-label="Main navigation">
        <ul className="space-y-0.5 px-2 pb-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link href={item.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium ${isActive ? "bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/50"}`} aria-current={isActive ? "page" : undefined}>
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[var(--accent)]" : ""}`} aria-hidden="true" />
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
          {/* ── Your Playlists ── */}
          <div className="px-5 py-2 border-t border-[var(--border)]" id="sidebar-your-playlists-heading">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.12em]">Your Playlists</span>
          </div>
          {localPlaylists.length > 0 ? (
            <nav className="px-2 overflow-y-auto max-h-32" aria-label="Your playlists" aria-labelledby="sidebar-your-playlists-heading">
              <ul className="space-y-0.5">
                {localPlaylists.slice(0, 8).map((pl) => (
                  <li key={pl.id}>
                    <Link href={`/playlist/local/${pl.id}`} onClick={onClose} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm truncate transition-all ${isLocalPlaylistActive(pl.id) ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`} aria-current={isLocalPlaylistActive(pl.id) ? "page" : undefined}>
                      <MusicNoteStrokeIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-60" aria-hidden="true" />
                      <span className="truncate">{pl.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="px-5 py-3">
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                No playlists yet. Tap <span className="text-[var(--accent)]">+ New Playlist</span> below to create one.
              </p>
            </div>
          )}

          {/* ── Deezer Charts ── */}
          <div className="px-5 py-2 border-t border-[var(--border)]" id="sidebar-deezer-charts-heading">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.12em]">Deezer Charts</span>
          </div>
          <nav aria-label="Deezer charts" aria-labelledby="sidebar-deezer-charts-heading">
            <ul className="space-y-0.5 px-2 pb-1">
              {deezerPlaylists.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={onClose} className={`block px-3 py-1.5 rounded-lg text-sm truncate transition-all ${pathname === item.href ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-2 py-2 border-t border-[var(--border)]">
            <button onClick={onCreatePlaylist} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all" aria-label="Create new playlist">
              <PlusIcon className="w-4 h-4 flex-shrink-0" />
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
  const [localPlaylists, setLocalPlaylists] = useState<LocalPlaylist[]>([])

  function refreshPlaylists() {
    setLocalPlaylists(getPlaylists())
  }

  useEffect(() => { refreshPlaylists() }, [])

  // Close mobile sidebar on navigation
  useEffect(() => { setMobileOpen(false) }, [pathname, setMobileOpen])

  // Hide sidebar on Now Playing page for immersive full-screen experience
  if (pathname.startsWith('/now-playing')) return null

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${collapsed ? "w-16" : "w-64"} glass-subtle text-[var(--text-primary)] flex-col transition-all duration-300 flex-shrink-0 h-full border-r border-[var(--border)]`}>
        <div className="p-5 pb-3 flex items-center gap-3 flex-shrink-0">
          <Link href="/" className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm hover:opacity-90 transition-all">
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </Link>
          {!collapsed && <span className="font-bold text-lg tracking-tight">Muse</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all hidden md:block cursor-pointer" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <CollapseIcon className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none">
          <SidebarContent localPlaylists={localPlaylists} collapsed={collapsed} onCreatePlaylist={() => setShowCreateModal(true)} />
        </div>
        {!collapsed && (
          <div className="px-2 pb-3 border-t border-[var(--border)] pt-2 flex-shrink-0">
            <ConnectionIndicator />
            <ThemeToggle collapsed={collapsed} />
            <AccentPicker collapsed={collapsed} />
          </div>
        )}
      </aside>

      {/* Mobile sidebar (overlay drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex md:hidden w-72 max-w-[85vw] glass text-[var(--text-primary)] flex-col transition-all duration-300 h-full border-r border-[var(--border)] shadow-xl overflow-y-auto ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 pb-3">
          <Link href="/" className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </Link>
          <span className="font-bold text-lg tracking-tight mr-auto ml-3">Muse</span>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent localPlaylists={localPlaylists} collapsed={false} onClose={() => setMobileOpen(false)} onCreatePlaylist={() => { setShowCreateModal(true); setMobileOpen(false) }} />
        {/* Mobile theme toggle at bottom */}
        <div className="px-2 py-3 border-t border-[var(--border)] mt-auto">
          <ThemeToggle collapsed={false} />
          <AccentPicker collapsed={false} />
        </div>
      </aside>

      {/* Create Playlist Modal (lazy loaded) */}
      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); refreshPlaylists() }}
        />
      )}
    </>
  )
}

function ConnectionIndicator() {
  const { info, online } = useConnectionQuality()

  if (!online || !info) return null

  const bars = qualityBars(info.effectiveType)
  const color = qualityColor(info.effectiveType)
  const label = qualityLabel(info.effectiveType)

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 text-xs"
      title={`${label} · ${info.downlink.toFixed(1)} Mbps · ${info.rtt}ms RTT`}
    >
      {/* Signal bars */}
      <div className="flex items-end gap-[2px] h-3">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full transition-all duration-300 ${
              i <= bars ? color : "bg-[var(--border)]"
            }`}
            style={{ height: `${i * 25}%` }}
          />
        ))}
      </div>
      <span className={`${color} font-medium tabular-nums`}>{label}</span>
      {info.saveData && (
        <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-1 rounded font-medium">
          SD
        </span>
      )}
    </div>
  )
}

function ThemeToggle({ collapsed, onClose }: { collapsed?: boolean; onClose?: () => void }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={() => { toggleTheme(); onClose?.() }}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <SunIcon className="w-4 h-4 flex-shrink-0" /> : <MoonIcon className="w-4 h-4 flex-shrink-0" />}
      {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
    </button>
  )
}

function AccentPicker({ collapsed }: { collapsed?: boolean }) {
  const { theme, accentIndex, setAccentIndex } = useTheme()
  if (collapsed) return null
  return (
    <div className="px-3 py-2">
      <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Accent Color</p>
      <div className="flex flex-wrap gap-1.5">
        {ACCENT_COLORS.map((color, i) => (
          <button
            key={color.name}
            onClick={() => setAccentIndex(i)}
            title={color.name}
            className={`w-5 h-5 rounded-full transition-all ${accentIndex === i ? "ring-2 ring-offset-1 ring-offset-[var(--bg-secondary)] scale-110" : "hover:scale-110"}`}
            style={{
              backgroundColor: theme === "dark" ? color.dark : color.light,
              '--tw-ring-color': theme === "dark" ? color.dark : color.light,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}
