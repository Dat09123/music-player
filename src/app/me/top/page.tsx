import dynamic from "next/dynamic"

const TopClient = dynamic(() => import("./TopClient"), {
  loading: () => (
    <div className="p-6 max-w-5xl mx-auto animate-pulse space-y-4">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  ),
})

export const metadata = {
  title: "Top Charts - Muse",
  description: "Trending tracks and artists on Deezer",
}

export default function TopPage() {
  return <TopClient />
}
