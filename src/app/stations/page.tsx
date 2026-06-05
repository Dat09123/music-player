"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getGenres } from "@/lib/deezer"
import { getGenreIcon } from "@/lib/utils"
import LazyImage from "@/components/LazyImage"
import Skeleton from "@/components/Skeleton"
import { MusicNoteIcon, ArrowRightIcon, EmptyMusicIcon } from "@/components/Icons"

const genreGradients: Record<string, string> = {
  Pop: "from-pink-500 to-rose-500",
  Rock: "from-amber-600 to-red-600",
  "Hip Hop": "from-yellow-500 to-orange-500",
  Jazz: "from-blue-600 to-indigo-700",
  Classical: "from-stone-500 to-amber-800",
  Electronic: "from-cyan-500 to-blue-600",
  Dance: "from-purple-500 to-pink-500",
  RnB: "from-violet-500 to-purple-600",
  Soul: "from-red-400 to-rose-600",
  Reggae: "from-green-600 to-emerald-700",
  Blues: "from-sky-600 to-blue-700",
  Country: "from-amber-600 to-yellow-700",
  Metal: "from-gray-600 to-zinc-800",
  Indie: "from-teal-500 to-cyan-600",
  Folk: "from-lime-600 to-green-700",
  Latin: "from-red-500 to-orange-500",
  Alternative: "from-emerald-500 to-teal-600",
  Punk: "from-red-700 to-rose-800",
  Funk: "from-fuchsia-500 to-purple-600",
  Gospel: "from-amber-400 to-yellow-500",
}

function getGradient(name: string): string {
  for (const [key, gradient] of Object.entries(genreGradients)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return gradient
  }
  return "from-[var(--accent)] to-indigo-600"
}

export default function StationsPage() {
  const [genres, setGenres] = useState<{ id: number; name: string; picture: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getGenres()
        if (!cancelled) setGenres(data)
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load genres")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="p-6 pb-20 max-w-7xl mx-auto">
        <Skeleton width={240} height={36} className="mb-2" />
        <Skeleton width={180} height={16} className="mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden">
              <Skeleton variant="card" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Could not load stations</h2>
        <p className="text-sm text-[var(--text-muted)]">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)]">Music Stations</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Discover curated radio stations by genre</p>
      </div>

      {/* Genre grid */}
      {genres.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {genres.map((genre, i) => (
            <Link
              key={genre.id}
              href={`/stations/${genre.id}`}
              className={`group relative overflow-hidden rounded-xl aspect-square flex flex-col justify-end animate-fade-in-up stagger-${Math.min(i + 1, 12)}`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(genre.name)} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Genre image */}
              {genre.picture && (
                <LazyImage
                  src={genre.picture}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                />
              )}

              {/* Bottom overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Content */}
              <div className="relative z-10 p-4">
                <span className="text-3xl mb-2 block">{getGenreIcon(genre.name)}</span>
                <h3 className="text-lg font-bold text-white">{genre.name}</h3>
                <div className="flex items-center gap-1 text-white/70 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>Listen now</span>
                  <ArrowRightIcon className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
          <EmptyMusicIcon className="w-16 h-16 mb-4 opacity-30" strokeWidth={1} />
          <p className="text-lg font-medium text-[var(--text-primary)] mb-1">No stations available</p>
        </div>
      )}

      {/* Bottom info */}
      <p className="text-xs text-[var(--text-muted)] text-center mt-10">
        Radio stations powered by Deezer — click a genre to start listening
      </p>
    </div>
  )
}
