import { NextRequest, NextResponse } from "next/server"

const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary"

export async function GET(request: NextRequest) {
  const start = performance.now()
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get("name")

    if (!name) {
      return NextResponse.json(
        { error: "Missing 'name' query parameter" },
        { status: 400 }
      )
    }

    const url = `${WIKI_API}/${encodeURIComponent(name)}`

    console.debug(`[Wiki Proxy] ➡ ${url}`)

    const res = await fetch(url, {
      headers: { "User-Agent": "MusePlayer/1.0" },
      cache: "force-cache",
    })

    const duration = Math.round(performance.now() - start)
    console.debug(`[Wiki Proxy] ${res.ok ? "✅" : "❌"} ${url} → ${res.status} (${duration}ms)`)

    if (res.status === 404) {
      return NextResponse.json({ bio: null, description: null })
    }

    if (!res.ok) {
      const text = await res.text()
      console.error(`[Wiki Proxy] ❌ ${url} → ${res.status}: ${text.slice(0, 200)}`)
      return NextResponse.json({ bio: null, description: null })
    }

    const data = await res.json()
    return NextResponse.json({
      bio: data.extract || null,
      description: data.description || null,
      thumbnail: data.thumbnail?.source || null,
    })
  } catch (error) {
    const duration = Math.round(performance.now() - start)
    console.error(`[Wiki Proxy] 💥 after ${duration}ms:`, error)
    return NextResponse.json({ bio: null, description: null })
  }
}
