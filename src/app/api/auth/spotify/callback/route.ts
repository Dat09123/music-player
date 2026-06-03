import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  // Redirect back to the app with the code/error as query params
  // The AuthContext will handle the token exchange
  const redirectUrl = new URL("/", request.url)
  if (code) redirectUrl.searchParams.set("code", code)
  if (error) redirectUrl.searchParams.set("error", error)

  return NextResponse.redirect(redirectUrl)
}
