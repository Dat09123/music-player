import dynamic from "next/dynamic"

const ArtistHistoryClient = dynamic(() => import("./ArtistHistoryClient"), {
  loading: () => (
    <div className="p-6 max-w-5xl mx-auto animate-pulse space-y-4">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="text-center space-y-3">
            <div className="aspect-square rounded-full bg-gray-200 dark:bg-gray-800 mx-auto" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  ),
})

export default function ArtistHistoryPage() {
  return <ArtistHistoryClient />
}
