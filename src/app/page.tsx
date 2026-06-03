import { getFeaturedPlaylists, getNewReleases } from "@/lib/spotify"
import { getImage, formatNumber } from "@/lib/utils"
import Card from "@/components/Card"
import TrackList from "@/components/TrackList"
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
  } catch (e) {
    error = "Could not load data from Spotify. Make sure your credentials are correct in .env.local"
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Configuration Required</h2>
        <p className="text-zinc-400 max-w-md mb-6 leading-relaxed">{error}</p>
        <div className="bg-zinc-900 rounded-xl p-6 max-w-lg w-full text-left">
          <p className="text-sm font-semibold text-zinc-300 mb-3">Quick setup:</p>
          <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
            <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">Spotify Developer Dashboard</a></li>
            <li>Create a new app</li>
            <li>Copy your Client ID and Client Secret</li>
            <li>Add them to <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">.env.local</code></li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-10 pb-28">
      {/* Hero */}
      <section>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-800 via-green-900 to-black p-8 md:p-12">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              Good evening
            </h1>
            <p className="text-green-200/80 text-lg max-w-xl">
              Discover new music, explore playlists, and enjoy your favorite tracks.
            </p>
            <div className="flex gap-3 mt-6">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-2.5 rounded-full hover:scale-105 transition-transform"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Start Searching
              </Link>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-green-600/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Featured Playlists */}
      {featuredPlaylists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white">Featured Playlists</h2>
            <Link href="/search" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
              Show all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {featuredPlaylists.slice(0, 12).map((playlist: any) => (
              <Card
                key={playlist.id}
                id={playlist.id}
                name={playlist.name}
                description={playlist.description}
                imageUrl={getImage(playlist.images)}
                type="playlist"
                href={`/playlist/${playlist.id}`}
                subtext={playlist.tracks?.total ? `${formatNumber(playlist.tracks.total)} tracks` : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* New Releases */}
      {newReleases.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white">New Releases</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {newReleases.slice(0, 12).map((album: any) => (
              <Card
                key={album.id}
                id={album.id}
                name={album.name}
                imageUrl={getImage(album.images)}
                type="album"
                href={`/album/${album.id}`}
                subtext={`${new Date(album.release_date).getFullYear()} • ${album.artists?.map((a: any) => a.name).join(", ")}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state if no data */}
      {featuredPlaylists.length === 0 && newReleases.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <svg className="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-lg font-medium mb-1">No data yet</p>
          <p className="text-sm">Try again after configuring your Spotify API credentials</p>
        </div>
      )}
    </div>
  )
}
