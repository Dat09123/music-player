import dynamic from "next/dynamic"

const LikedClient = dynamic(() => import("./LikedClient"), {
  loading: () => (
    <div className="p-6 max-w-5xl mx-auto animate-pulse space-y-4">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),
})

export const metadata = {
  title: "Liked Songs - Muse",
  description: "Your liked songs",
}

export default function LikedPage() {
  return <LikedClient />
}
