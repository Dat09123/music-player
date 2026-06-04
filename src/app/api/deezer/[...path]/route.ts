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

    const res = await fetch(url, {
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Deezer API error (${res.status})`, detail: text.slice(0, 500) },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Deezer proxy error:", error)
    return NextResponse.json(
      { error: "Failed to fetch from Deezer API" },
      { status: 500 }
    )
  }
}
