/**
 * PKCE (Proof Key for Code Exchange) utilities
 * Used for Spotify Authorization Code Flow
 */

/**
 * Generate a random string for the code_verifier
 * Must be 43-128 characters from [A-Za-z0-9-._~]
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  return Array.from(array)
    .map((byte) => chars[byte % chars.length])
    .join("")
}

/**
 * Generate a code_challenge from the code_verifier
 * Base64URL-encoded SHA256 hash of the code_verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return base64URLEncode(new Uint8Array(hash))
}

/**
 * Base64URL encode (no padding, replace +/ with -_)
 */
function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/**
 * Parse Spotify callback hash parameters
 */
export function parseSpotifyCallback(hash: string): { accessToken?: string; error?: string } {
  const params = new URLSearchParams(hash.replace("#", "?"))
  const accessToken = params.get("access_token") || undefined
  const error = params.get("error") || undefined
  return { accessToken, error }
}

/**
 * Get auth URL for Spotify Authorization Code Flow with PKCE
 */
export async function getSpotifyAuthUrl(clientId: string, redirectUri: string): Promise<URL> {
  const scope = [
    "user-read-private",
    "user-read-email",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-top-read",
    "user-library-read",
    "user-library-modify",
  ].join(" ")

  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Store code_verifier for the callback
  localStorage.setItem("spotify_code_verifier", codeVerifier)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    scope,

  })

  return new URL(`https://accounts.spotify.com/authorize?${params}`)
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  clientId: string,
  redirectUri: string
): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${error}`)
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string
): Promise<{
  accessToken: string
  expiresIn: number
}> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Token refresh failed: ${res.status} ${error}`)
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  }
}
