"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/AuthContext"
import { useTheme } from "@/lib/ThemeContext"
import { useSidebar } from "./SidebarContext"
import { HomeIcon, WarningIcon, SunIcon, MoonIcon, MenuIcon, XIcon } from "@/components/Icons"

export default function Header() {
  const pathname = usePathname()
  const { mobileOpen, toggleMobile } = useSidebar()
  const { authError } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const pageNames: Record<string, string> = {
    "/": "Home",
    "/search": "Search",
    "/me/liked": "Liked Songs",
    "/me/top": "Top Charts",
  }

  const currentPage = pageNames[pathname] || (pathname.startsWith("/playlist") ? "Playlist" : pathname.startsWith("/album") ? "Album" : pathname.startsWith("/artist") ? "Artist" : "")

  return (
    <header className="sticky top-0 z-40 glass-subtle border-b border-[var(--border)]">
      {/* Auth error banner */}
      {authError && (
        <div className="px-5 py-2.5 bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/50">
          <div className="flex items-start gap-2 max-w-4xl mx-auto">
            <WarningIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
              {authError}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1">
            <HomeIcon className="w-5 h-5" />
          </Link>
          <span className="text-[var(--text-muted)] text-sm">/</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{currentPage}</span>
        </div>

        <div className="flex items-center gap-2">
          {authError && <span className="text-xs text-red-500">{authError}</span>}
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:shadow-sm transition-all"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
          <button onClick={toggleMobile} className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1" aria-label={mobileOpen ? "Close menu" : "Open menu"}>
            {mobileOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  )
}
