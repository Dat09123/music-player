import type { Metadata, Viewport } from "next"
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
import KeyboardShortcuts from "@/components/KeyboardShortcuts"
import { SidebarProvider } from "@/components/SidebarContext"
import MobileNav from "@/components/MobileNav"
import PageTransition from "@/components/PageTransition"
import DynamicTitle from "@/components/DynamicTitle"
import PWARegister from "@/components/PWARegister"
import NetworkStatus from "@/components/NetworkStatus"
import StaleDataBanner from "@/components/StaleDataBanner"
import OfflineRetryHandler from "@/components/OfflineRetryHandler"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#6366f1" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "Muse — Listen to music",
    template: "%s — Muse",
  },
  description: "Listen to your favorite tracks from Deezer. Discover music, explore playlists and albums, and enjoy a seamless streaming experience.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Muse — Listen to music",
    description: "Listen to your favorite tracks from Deezer. Discover music, explore playlists and albums.",
    type: "website",
    siteName: "Muse",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muse — Listen to music",
    description: "Listen to your favorite tracks from Deezer.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://muse.app"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("muse-theme")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()`
        }} />
        {/* Preconnect to Deezer CDN for faster API/image loading */}
        <link rel="preconnect" href="https://e-cdns-images.dzcdn.net" />
        <link rel="preconnect" href="https://cdn-images.dzcdn.net" />
        <link rel="preconnect" href="https://api.deezer.com" />
        <link rel="dns-prefetch" href="https://e-cdns-images.dzcdn.net" />
        <link rel="dns-prefetch" href="https://cdn-images.dzcdn.net" />
        <link rel="dns-prefetch" href="https://api.deezer.com" />
        <link rel="apple-touch-icon" href="/icon-192.png" sizes="192x192" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {/* Skip to content link — for keyboard/AT users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to content
        </a>

        <ThemeProvider>
        <AuthProvider>
        <ToastProvider>
        <SidebarProvider>
          <PlayerProvider>
            <OfflineRetryHandler />
            <StaleDataBanner />
            <NetworkStatus />
            <PWARegister />
            <DynamicTitle />
            <KeyboardShortcuts />
            <div className="flex h-full">
              <ErrorBoundary label="Sidebar">
                <Sidebar />
              </ErrorBoundary>
              <div className="flex-1 flex flex-col min-w-0 min-h-0">
                <ErrorBoundary label="Header">
                  <Header />
                </ErrorBoundary>
                <ErrorBoundary label="Page Content" fallback={<ErrorFallback />}>
                  <main id="main-content" className="flex-1 overflow-y-auto pb-40 md:pb-24" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10rem)" }}>
                    <PageTransition>
                      {children}
                    </PageTransition>
                  </main>
                </ErrorBoundary>
              </div>
            </div>
            <MobileNav />
          </PlayerProvider>
        </SidebarProvider>
        </ToastProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
