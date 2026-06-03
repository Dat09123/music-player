import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { PlayerProvider } from "@/components/Player"
import { AuthProvider } from "@/lib/AuthContext"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Spotify Music - Listen to music",
  description: "A Spotify-powered music streaming web app. Discover new music, create playlists, and enjoy your favorite tracks.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-black text-white">
        <AuthProvider>
          <PlayerProvider>
            <div className="flex h-full">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto pb-24">
                  {children}
                </main>
              </div>
            </div>
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
