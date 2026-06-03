"use client"

import { useAuth } from "@/lib/AuthContext"
import { useState, useRef, useEffect } from "react"

export default function SpotifyLoginButton() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
    )
  }

  if (isAuthenticated && user) {
    const avatarUrl = user.images?.[0]?.url
    const initials = user.display_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-green-500 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.display_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white">{initials || "U"}</span>
            )}
          </div>
          <span className="hidden md:block text-sm font-medium text-white pr-2 max-w-[120px] truncate">
            {user.display_name}
          </span>
          <svg
            className={`w-4 h-4 text-zinc-400 mr-2 transition-transform ${showMenu ? "rotate-180" : ""} hidden md:block`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-zinc-800 rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
            {/* User info */}
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-sm font-medium text-white truncate">{user.display_name}</p>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setShowMenu(false)
                  window.open(user.external_urls?.spotify, "_blank")
                }}
                className="w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                </svg>
                Open in Spotify
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  logout()
                }}
                className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-full text-sm transition-all hover:scale-105 active:scale-95"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
      Log in
    </button>
  )
}
