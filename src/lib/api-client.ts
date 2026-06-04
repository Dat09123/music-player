"use client"

export type TokenGetter = () => Promise<string | null>

/**
 * Call the API proxy with the user's access token.
 * Automatically refreshes the token on 401 and retries once.
 */
export async function spotifyFetch<T = any>(
  path: string,
  getToken: TokenGetter
): Promise<T> {
  const initialToken = await getToken()
  if (!initialToken) throw new Error("AUTH_REQUIRED")

  const doFetch = async (token: string): Promise<T> => {
    const res = await fetch(`/api/spotify/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    if (res.status === 401) {
      throw new Error("AUTH_REQUIRED")
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.detail || error.error || `Spotify API error (${res.status})`)
    }

    return res.json()
  }

  try {
    return await doFetch(initialToken)
  } catch (err: any) {
    if (err?.message === "AUTH_REQUIRED") {
      const freshToken = await forceRefreshToken(getToken, initialToken)
      if (freshToken) return doFetch(freshToken)
    }
    throw err
  }
}

/**
 * Force-invalidate session so getToken() triggers a refresh,
 * then try to get a fresh token. Returns the new token or null.
 */
async function forceRefreshToken(
  getToken: TokenGetter,
  currentToken: string
): Promise<string | null> {
  const session = localStorage.getItem("spotify_session")
  if (session) {
    try {
      const parsed = JSON.parse(session)
      parsed.expiresAt = 0
      localStorage.setItem("spotify_session", JSON.stringify(parsed))
    } catch {
      // ignore
    }
  }

  const freshToken = await getToken()
  if (freshToken && freshToken !== currentToken) {
    return freshToken
  }
  return null
}

/**
 * Fetch from any Spotify API endpoint with auto-retry on 401.
 * Use this for direct Spotify API calls (not through the proxy).
 */
export async function spotifyFetchDirect<T = any>(
  url: string,
  options: RequestInit,
  getToken: TokenGetter
): Promise<T> {
  const initialToken = await getToken()
  if (!initialToken) throw new Error("AUTH_REQUIRED")

  const doFetch = async (token: string): Promise<T> => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })

    if (res.status === 401) {
      throw new Error("AUTH_REQUIRED")
    }

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Spotify API error (${res.status}): ${text.slice(0, 200)}`)
    }

    return res.json()
  }

  try {
    return await doFetch(initialToken)
  } catch (err: any) {
    if (err?.message === "AUTH_REQUIRED") {
      const freshToken = await forceRefreshToken(getToken, initialToken)
      if (freshToken) return doFetch(freshToken)
    }
    throw err
  }
}
