import { getFeaturedPlaylists, getNewReleases } from "@/lib/spotify"
import { getImage, formatNumber } from "@/lib/utils"
import Card from "@/components/Card"
import Link from "next/link"

export default async function HomePage() {
  let featuredPlaylists: any[] = []
  let newReleases: any[] = []
  let error: string | null = null

  try {
    const [featuredData, newReleasesData] = await Promise.all([
      getFeaturedPlaylists().catch(() => ({ playlists: { items: [] } })),
      getNewReleases().catch(() => ({ albums: { items: [] } })),
    ])
    featuredPlaylists = featuredData.playlists?.items || []
    newReleases = newReleasesData.albums?.items || []
  } catch (e: any) {
    error = e?.message || "Could not load data from Spotify"
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Configuration Required</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">{error}</p>
        <div className="bg-white rounded-xl border border-[var(--border)] p-5 max-w-sm w-full text-left text-sm">
          <p className="font-medium text-[var(--text-primary)] mb-2">Quick setup:</p>
          <ol className="text-[var(--text-secondary)] space-y-1.5 list-decimal list-inside text-xs">
            <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Spotify Developer Dashboard</a></li>
            <li>Copy your Client ID and Client Secret</li>
            <li>On Vercel: Settings → Environment Variables → Add them</li>
            <li>Or locally: copy <code className="bg-gray-100 px-1 rounded text-xs">.env.example</code> → <code className="bg-gray-100 px-1 rounded text-xs">.env.local</code></li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-8 pb-28 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 p-6 md:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">Discover Music</h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-lg">Explore featured playlists and new releases.</p>
          <div className="flex gap-2 mt-4">
            <Link href="/search" className="inline-flex items-center gap-1.5 bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Search Music
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Playlists */}
      {featuredPlaylists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Featured Playlists</h2>
            <Link href="/search" className="text-xs font-medium text-[var(--accent)] hover:underline">Show all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {featuredPlaylists.slice(0, 12).map((playlist: any) => (
              <Card key={playlist.id} id={playlist.id} name={playlist.name} description={playlist.description} imageUrl={getImage(playlist.images)} type="playlist" href={`/playlist/${playlist.id}`} subtext={playlist.tracks?.total ? `${formatNumber(playlist.tracks.total)} tracks` : undefined} />
            ))}
          </div>
        </section>
      )}

      {/* New Releases */}
      {newReleases.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">New Releases</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {newReleases.slice(0, 12).map((album: any) => (
              <Card key={album.id} id={album.id} name={album.name} imageUrl={getImage(album.images)} type="album" href={`/album/${album.id}`} subtext={`${new Date(album.release_date).getFullYear()} • ${album.artists?.map((a: any) => a.name).join(", ")}`} />
            ))}
          </div>
        </section>
      )}

      {featuredPlaylists.length === 0 && newReleases.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
          <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
          <p className="text-sm font-medium">No data yet</p>
          <p className="text-xs mt-1">Try again after configuring Spotify credentials</p>
        </div>
      )}
    </div>
  )
}
