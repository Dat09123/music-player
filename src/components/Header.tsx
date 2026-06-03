"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import SpotifyLoginButton from "./SpotifyLoginButton"

export default function Header() {
  const pathname = usePathname()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const isHome = pathname === "/"
  const isSearch = pathname.startsWith("/search")
  const isPlaylist = pathname.startsWith("/playlist")
  const isAlbum = pathname.startsWith("/album")
  const isArtist = pathname.startsWith("/artist")

  return (
    <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-sm font-medium text-zinc-300 capitalize">
            {isHome ? "Home" : isSearch ? "Search" : isPlaylist ? "Playlist" : isAlbum ? "Album" : isArtist ? "Artist" : ""}
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Spotify Login / User Menu */}
          <SpotifyLoginButton />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-zinc-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {showMobileMenu && (
        <div className="md:hidden bg-zinc-900 border-t border-white/5 px-4 py-3 space-y-2">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-lg text-sm ${isHome ? "bg-white/10 text-white" : "text-zinc-400"}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Home
          </Link>
          <Link
            href="/search"
            className={`block px-3 py-2 rounded-lg text-sm ${isSearch ? "bg-white/10 text-white" : "text-zinc-400"}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Search
          </Link>
        </div>
      )}
    </header>
  )
}
