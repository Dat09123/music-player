"use client"

import Link from "next/link"

interface CardProps {
  id: string
  name: string
  description?: string
  imageUrl: string
  type: "playlist" | "album" | "artist" | "category"
  href: string
  subtext?: string
}

export default function Card({ name, description, imageUrl, type, href, subtext }: CardProps) {
  return (
    <Link
      href={href}
      className="group bg-zinc-900/40 hover:bg-zinc-800/60 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
    >
      <div className="relative mb-4">
        <div
          className={`w-full aspect-square rounded-full overflow-hidden bg-zinc-800 shadow-lg ${
            type === "artist" ? "rounded-full" : "rounded-lg"
          }`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900">
              <svg className="w-12 h-12 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                {type === "artist" ? (
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                ) : (
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                )}
              </svg>
            </div>
          )}
        </div>
        {/* Play button overlay */}
        <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-400 hover:scale-105">
          <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
      <h3 className="font-bold text-sm text-white truncate mb-1">{name}</h3>
      {description && (
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{description}</p>
      )}
      {subtext && (
        <p className="text-xs text-zinc-500 mt-1">{subtext}</p>
      )}
    </Link>
  )
}
