import { NextRequest, NextResponse } from "next/server"
import { getClientCredentialsToken } from "@/lib/spotify"

const SPOTIFY_API = "https://api.spotify.com/v1"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const token = await getClientCredentialsToken()
    const pathStr = path.join("/")
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${SPOTIFY_API}/${pathStr}${searchParams ? `?${searchParams}` : ""}`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json(
        { error: `Spotify API error (${res.status})`, detail: error },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Spotify proxy error:", error)
    return NextResponse.json(
      { error: "Failed to fetch from Spotify API" },
      { status: 500 }
    )
  }
}
