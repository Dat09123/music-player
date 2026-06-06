import { NextRequest, NextResponse } from "next/server"

const DEEZER_API = "https://api.deezer.com"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const pathStr = path.join("/")
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${DEEZER_API}/${pathStr}${searchParams ? `?${searchParams}` : ""}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000) // 20s server-side timeout

    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    if (!res.ok) {
      return NextResponse.json(
        { error: `Deezer API error (${res.status})` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "AbortError"
    return NextResponse.json(
      { error: isTimeout ? "Deezer API timed out" : "Failed to fetch from Deezer API" },
      { status: isTimeout ? 504 : 500 }
    )
  }
}
