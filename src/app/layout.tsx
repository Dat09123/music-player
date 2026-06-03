import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { PlayerProvider } from "@/components/Player"
import { AuthProvider } from "@/lib/AuthContext"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Muse - Listen to music",
  description: "A clean, minimal music streaming experience powered by Spotify.",
  icons: { icon: [{ url: "/favicon.ico" }] },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <AuthProvider>
          <PlayerProvider>
            <div className="flex h-full">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto pb-28">
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
