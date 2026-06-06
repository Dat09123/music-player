import { NextRequest, NextResponse } from "next/server"

const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary"

export async function GET(request: NextRequest) {
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

    const res = await fetch(url, {
      headers: { "User-Agent": "MusePlayer/1.0" },
      cache: "force-cache",
    })

    if (res.status === 404) {
      return NextResponse.json({ bio: null, description: null })
    }

    if (!res.ok) {
      return NextResponse.json({ bio: null, description: null })
    }

    const data = await res.json()
    return NextResponse.json({
      bio: data.extract || null,
      description: data.description || null,
      thumbnail: data.thumbnail?.source || null,
    })
  } catch {
    return NextResponse.json({ bio: null, description: null })
  }
}
