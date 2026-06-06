import { NextRequest, NextResponse } from "next/server"

const LRCLIB_API = "https://lrclib.net/api"

/**
 * Fetch lyrics from LRCLIB.
 * Strategy:
 *   1. Try exact match via GET /api/get?artist=...&track=...
 *   2. Fall back to search via GET /api/search?q=...
 *   3. Pick the best result (synced > plain, best name match)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const artist = searchParams.get("artist")?.trim() || ""
    const track = searchParams.get("track")?.trim() || ""

    if (!track) {
      return NextResponse.json(
        { error: "Missing 'track' query parameter" },
        { status: 400 }
      )
    }

    let bestResult: { plainLyrics: string | null; syncedLyrics: string | null } | null = null

    // ── Phase 1: Exact match ──
    if (artist) {
      const exactUrl = `${LRCLIB_API}/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(track)}`
      const exactRes = await fetch(exactUrl, {
        headers: { "User-Agent": "MusePlayer/1.0" },
        cache: "no-store",
      })

      if (exactRes.ok) {
        const exactData = await exactRes.json()
        if (exactData && (exactData.plainLyrics || exactData.syncedLyrics)) {
          bestResult = {
            plainLyrics: exactData.plainLyrics || null,
            syncedLyrics: exactData.syncedLyrics || null,
          }
        }
      }
    }

    // ── Phase 2: Search fallback ──
    if (!bestResult) {
      const q = artist
        ? encodeURIComponent(`${artist} ${track}`)
        : encodeURIComponent(track)
      const searchUrl = `${LRCLIB_API}/search?q=${q}`

      const searchRes = await fetch(searchUrl, {
        headers: { "User-Agent": "MusePlayer/1.0" },
        cache: "no-store",
      })

      if (searchRes.ok) {
        const searchData = await searchRes.json()
        const items: any[] = Array.isArray(searchData) ? searchData : []

        // Score results by how well they match the requested artist + track
        const scored = items
          .filter((item: any) => item.plainLyrics || item.syncedLyrics)
          .map((item: any) => {
            let score = 0
            const itemArtist = (item.artistName || "").toLowerCase()
            const itemTrack = (item.trackName || "").toLowerCase()
            const queryArtist = artist.toLowerCase()
            const queryTrack = track.toLowerCase()

            if (itemArtist === queryArtist) score += 10
            else if (itemArtist.includes(queryArtist) || queryArtist.includes(itemArtist)) score += 5
            if (itemTrack === queryTrack) score += 10
            else if (itemTrack.includes(queryTrack) || queryTrack.includes(itemTrack)) score += 5
            if (item.syncedLyrics) score += 3

            return { score, item }
          })
          .sort((a, b) => b.score - a.score)

        if (scored.length > 0) {
          const top = scored[0]
          bestResult = {
            plainLyrics: top.item.plainLyrics || null,
            syncedLyrics: top.item.syncedLyrics || null,
          }
        }
      }
    }

    return NextResponse.json({ result: bestResult })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch lyrics", result: null },
      { status: 500 }
    )
  }
}
