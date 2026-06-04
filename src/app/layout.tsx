import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { PlayerProvider } from "@/components/Player"
import { AuthProvider } from "@/lib/AuthContext"
import { ThemeProvider } from "@/lib/ThemeContext"
import ErrorBoundary from "@/components/ErrorBoundary"

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
          <PlayerProvider>
            <div className="flex h-full">
              <ErrorBoundary label="Sidebar">
                <Sidebar />
              </ErrorBoundary>
              <div className="flex-1 flex flex-col min-w-0">
                <ErrorBoundary label="Header">
                  <Header />
                </ErrorBoundary>
                <ErrorBoundary label="Page Content" fallback={
                  <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
                      <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Page error</h2>
                    <p className="text-sm text-[var(--text-muted)] mb-6">This page encountered an error.</p>
                    <button onClick={() => window.location.reload()} className="bg-[var(--accent)] hover:opacity-90 text-white font-medium px-5 py-2 rounded-lg text-sm transition-all">Try again</button>
                  </div>
                }>
                  <main className="flex-1 overflow-y-auto pb-20">
                    {children}
                  </main>
                </ErrorBoundary>
              </div>
            </div>
          </PlayerProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
