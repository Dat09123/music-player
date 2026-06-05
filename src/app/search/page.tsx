import dynamic from "next/dynamic"

const SearchClient = dynamic(() => import("./SearchClient"), {
  loading: () => (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),
})

export const metadata = {
  title: "Search - Muse",
  description: "Search for songs, albums, artists, and playlists on Deezer",
}

export default function SearchPage() {
  return <SearchClient />
}
