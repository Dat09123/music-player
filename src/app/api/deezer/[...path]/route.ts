import { NextRequest, NextResponse } from "next/server"

const DEEZER_API = "https://api.deezer.com"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const start = performance.now()
  try {
    const { path } = await params
    const pathStr = path.join("/")
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${DEEZER_API}/${pathStr}${searchParams ? `?${searchParams}` : ""}`

    console.debug(`[Deezer Proxy] ➡ ${url}`)

    const res = await fetch(url, {
      cache: "no-store",
    })

    const duration = Math.round(performance.now() - start)
    console.debug(`[Deezer Proxy] ${res.ok ? "✅" : "❌"} ${url} → ${res.status} (${duration}ms)`)

    if (!res.ok) {
      const text = await res.text()
      console.error(`[Deezer Proxy] ❌ ${url} → ${res.status}: ${text.slice(0, 200)}`)
      return NextResponse.json(
        { error: `Deezer API error (${res.status})`, detail: text.slice(0, 500) },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    const duration = Math.round(performance.now() - start)
    console.error(`[Deezer Proxy] 💥 after ${duration}ms:`, error)
    return NextResponse.json(
      { error: "Failed to fetch from Deezer API" },
      { status: 500 }
    )
  }
}
