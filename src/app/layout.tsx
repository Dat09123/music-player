import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { PlayerProvider } from "@/components/Player"
import { AuthProvider } from "@/lib/AuthContext"
import { ThemeProvider } from "@/lib/ThemeContext"
import ErrorBoundary from "@/components/ErrorBoundary"
import ErrorFallback from "@/components/ErrorFallback"
import { ToastProvider } from "@/components/Toast"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Muse - Listen to music",
  description: "Listen to your favorite tracks from Deezer.",
  icons: { icon: [{ url: "/favicon.ico" }] },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem("muse-theme")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()` }} />
      </head>
      <body className="h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider>
        <AuthProvider>
        <ToastProvider>
          <PlayerProvider>
            <div className="flex h-full">
              <ErrorBoundary label="Sidebar">
                <Sidebar />
              </ErrorBoundary>
              <div className="flex-1 flex flex-col min-w-0">
                <ErrorBoundary label="Header">
                  <Header />
                </ErrorBoundary>
                <ErrorBoundary label="Page Content" fallback={<ErrorFallback />}>
                  <main className="flex-1 overflow-y-auto pb-20">
                    {children}
                  </main>
                </ErrorBoundary>
              </div>
            </div>
          </PlayerProvider>
        </ToastProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
