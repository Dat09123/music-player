"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/AuthContext"
import SpotifyLoginButton from "./SpotifyLoginButton"

export default function Header() {
  const pathname = usePathname()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { authError } = useAuth()

  const pageNames: Record<string, string> = {
    "/": "Home",
    "/search": "Search",
    "/me/liked": "Liked Songs",
    "/me/top": "Top Charts",
  }

  const currentPage = pageNames[pathname] || (pathname.startsWith("/playlist") ? "Playlist" : pathname.startsWith("/album") ? "Album" : pathname.startsWith("/artist") ? "Artist" : "")

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
      {/* Auth error banner */}
      {authError && (
        <div className="px-5 py-2.5 bg-red-50 border-b border-red-100">
          <div className="flex items-start gap-2 max-w-4xl mx-auto">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div className="text-xs text-red-700 leading-relaxed">
              {authError}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <span className="text-[var(--text-muted)] text-sm">/</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">{currentPage}</span>
        </div>

        <div className="flex items-center gap-3">
          <SpotifyLoginButton />
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {showMobileMenu ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
