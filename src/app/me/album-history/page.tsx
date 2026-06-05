import dynamic from "next/dynamic"

const AlbumHistoryClient = dynamic(() => import("./AlbumHistoryClient"), {
  loading: () => (
    <div className="p-6 max-w-5xl mx-auto animate-pulse space-y-4">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  ),
})

export default function AlbumHistoryPage() {
  return <AlbumHistoryClient />
}
