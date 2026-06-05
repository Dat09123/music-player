"use client"

import { useConnectionQuality } from "@/hooks/useConnectionQuality"

export default function NetworkStatus() {
  const { online } = useConnectionQuality()

  if (online) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] bg-red-500/90 dark:bg-red-600/90 backdrop-blur-md text-white text-center py-2 px-4 text-xs font-medium animate-slide-down shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
        </svg>
        <span>
          You are offline — some features may be unavailable
        </span>
        <button
          onClick={() => window.location.reload()}
          className="ml-2 underline hover:no-underline text-white/80 hover:text-white transition-colors whitespace-nowrap"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
