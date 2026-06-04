"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getSpotifyAuthUrl, exchangeCodeForTokens, refreshAccessToken } from "./auth"
import type { SpotifyUser } from "./types"

interface AuthContextType {
  user: SpotifyUser | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  authError: string | null
  login: () => Promise<void>
  logout: () => void
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "911f8d7084e44f81a4ee75f3dd0d24c0"
// Spotify no longer allows 'localhost' - use 127.0.0.1 instead
// See: https://developer.spotify.com/documentation/web-api/concepts/redirect_uri
const REDIRECT_URI = typeof window !== "undefined"
  ? `${window.location.origin}/api/auth/spotify/callback`.replace("localhost", "127.0.0.1")
  : ""

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SpotifyUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Force loading to resolve after 3 seconds max (safety net)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Restore session on mount with cleanup
  useEffect(() => {
    let cancelled = false

    try {
      const stored = localStorage.getItem("spotify_session")
      if (!stored) {
        if (!cancelled) setIsLoading(false)
        return
      }

      const session = JSON.parse(stored)
      if (!session?.accessToken) {
        localStorage.removeItem("spotify_session")
        if (!cancelled) setIsLoading(false)
        return
      }

      if (cancelled) return
      setAccessToken(session.accessToken)

      const rt = session.refreshToken || null
      setRefreshToken(rt)

      // Fetch user profile with stored token
      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error("Unauthorized")
        })
        .then((userData) => {
          if (!cancelled) {
            setUser(userData)
            setAccessToken(session.accessToken)
            setIsLoading(false)
          }
        })
        .catch(async () => {
          if (cancelled) return
          // Token expired - try refresh
          if (!rt) {
            // No refresh token available, clear session
            localStorage.removeItem("spotify_session")
            if (!cancelled) {
              setAccessToken(null)
              setRefreshToken(null)
              setUser(null)
              setIsLoading(false)
            }
            return
          }

          try {
            const refreshed = await refreshAccessToken(rt, CLIENT_ID)
            if (cancelled) return
            setAccessToken(refreshed.accessToken)

            // Update stored session
            const updatedSession = {
              ...session,
              accessToken: refreshed.accessToken,
              expiresAt: Date.now() + refreshed.expiresIn * 1000,
            }
            localStorage.setItem("spotify_session", JSON.stringify(updatedSession))

            // Fetch user with new token
            const res = await fetch("https://api.spotify.com/v1/me", {
              headers: { Authorization: `Bearer ${refreshed.accessToken}` },
            })
            if (res.ok && !cancelled) {
              const userData = await res.json()
              setUser(userData)
            }
          } catch {
            // Refresh failed, clear everything
            localStorage.removeItem("spotify_session")
            if (!cancelled) {
              setAccessToken(null)
              setRefreshToken(null)
              setUser(null)
            }
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    } catch {
      // Invalid session data
      localStorage.removeItem("spotify_session")
      if (!cancelled) setIsLoading(false)
    }

    return () => { cancelled = true }
  }, [])

  // Handle callback from Spotify (after login redirect)
  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const error = params.get("error")

    if (error) {
      console.error("Spotify auth error:", error)
      setAuthError(`Spotify returned an error: ${error}. Make sure the redirect URI is added to your Spotify Dashboard. Current redirect URI: ${REDIRECT_URI}`)
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    if (code) {
      const codeVerifier = localStorage.getItem("spotify_code_verifier")
      if (!codeVerifier) {
        console.error("No code verifier found")
        setAuthError("Login session expired. Please try logging in again.")
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }

      setIsLoading(true)
      exchangeCodeForTokens(code, codeVerifier, CLIENT_ID, REDIRECT_URI)
        .then(async (tokens) => {
          if (cancelled) return

          // Store session immediately
          localStorage.setItem(
            "spotify_session",
            JSON.stringify({
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken || null,
              expiresAt: Date.now() + tokens.expiresIn * 1000,
            })
          )

          setAccessToken(tokens.accessToken)
          setRefreshToken(tokens.refreshToken)

          // Fetch user profile
          try {
            const res = await fetch("https://api.spotify.com/v1/me", {
              headers: { Authorization: `Bearer ${tokens.accessToken}` },
            })
            if (res.ok && !cancelled) {
              const userData = await res.json()
              setUser(userData)
            } else if (!cancelled) {
              const text = await res.text()
              console.warn("User profile fetch failed:", res.status, text.slice(0, 200))
            }
          } catch (profileErr) {
            console.warn("User profile fetch error:", profileErr)
          }

          if (!cancelled) {
            setIsLoading(false)
          }

          // Cleanup URL params and verifier
          localStorage.removeItem("spotify_code_verifier")
          window.history.replaceState({}, document.title, window.location.pathname)
        })
        .catch((err) => {
          if (cancelled) return
          const msg = err?.message || "Token exchange failed"
          console.error("Token exchange failed:", msg)
          setAuthError(`Login failed: ${msg}. Try logging in again. (Redirect URI: ${REDIRECT_URI})`)
          setIsLoading(false)
          window.history.replaceState({}, document.title, window.location.pathname)
        })
    }

    return () => { cancelled = true }
  }, [])

  const login = useCallback(async () => {
    try {
      setAuthError(null)
      // Check crypto.subtle availability
      if (!crypto?.subtle?.digest) {
        throw new Error("Crypto API not available. Make sure you're using HTTPS or localhost.")
      }
      const authUrl = await getSpotifyAuthUrl(CLIENT_ID, REDIRECT_URI)
      window.location.href = authUrl.toString()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start login"
      console.error("Failed to start login:", msg)
      setAuthError(msg)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    setAuthError(null)
    localStorage.removeItem("spotify_session")
    setIsLoading(false)
  }, [])

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!accessToken) return null

    // Check if token is expired
    const session = localStorage.getItem("spotify_session")
    if (session) {
      const parsed = JSON.parse(session)
      if (parsed.expiresAt < Date.now() && refreshToken) {
        try {
          const refreshed = await refreshAccessToken(refreshToken, CLIENT_ID)
          const newSession = { ...parsed, accessToken: refreshed.accessToken, expiresAt: Date.now() + refreshed.expiresIn * 1000 }
          localStorage.setItem("spotify_session", JSON.stringify(newSession))
          setAccessToken(refreshed.accessToken)
          return refreshed.accessToken
        } catch {
          return null
        }
      }
    }

    return accessToken
  }, [accessToken, refreshToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!accessToken,
        authError,
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
