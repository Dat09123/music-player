import { NextRequest, NextResponse } from "next/server"

const LRCLIB_API = "https://lrclib.net/api"

export async function GET(request: NextRequest) {
  const start = performance.now()
  try {
    const searchParams = request.nextUrl.searchParams
    const artist = searchParams.get("artist")
    const track = searchParams.get("track")

    if (!track) {
      return NextResponse.json(
        { error: "Missing 'track' query parameter" },
        { status: 400 }
      )
    }

    const q = artist
      ? encodeURIComponent(`${artist} ${track}`)
      : encodeURIComponent(track)
    const url = `${LRCLIB_API}/search?q=${q}`

    console.debug(`[Lyrics Proxy] ➡ ${url}`)

    const res = await fetch(url, {
      headers: { "User-Agent": "MusePlayer/1.0" },
      cache: "no-store",
    })

    const duration = Math.round(performance.now() - start)
    console.debug(`[Lyrics Proxy] ${res.ok ? "✅" : "❌"} ${url} → ${res.status} (${duration}ms)`)

    if (!res.ok) {
      const text = await res.text()
      console.error(`[Lyrics Proxy] ❌ ${url} → ${res.status}: ${text.slice(0, 200)}`)
      return NextResponse.json(
        { error: `LRCLIB error (${res.status})`, results: [] },
        { status: res.status }
      )
    }

    const data = await res.json()
    // data is an array of matching tracks with plainLyrics, syncedLyrics, etc.
    // Filter to items that have either plainLyrics or syncedLyrics
    const results = (Array.isArray(data) ? data : [])
      .filter((item: any) => item.plainLyrics || item.syncedLyrics)
      .map((item: any) => ({
        plainLyrics: item.plainLyrics || null,
        syncedLyrics: item.syncedLyrics || null,
      }))

    return NextResponse.json({ results })
  } catch (error) {
    const duration = Math.round(performance.now() - start)
    console.error(`[Lyrics Proxy] 💥 after ${duration}ms:`, error)
    return NextResponse.json(
      { error: "Failed to fetch lyrics", results: [] },
      { status: 500 }
    )
  }
}
