"use client"

// Call the API proxy with the user's access token
export async function spotifyFetch<T = any>(
  path: string,
  token: string
): Promise<T> {
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
