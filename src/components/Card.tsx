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
    <Link href={href} className="group bg-[var(--bg-secondary)]/50 backdrop-blur-sm rounded-xl border border-[var(--border)] p-3 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--accent)]/5 hover:-translate-y-1 hover:border-[var(--accent)]/20">
      <div className="relative mb-3">
        <div className={`w-full aspect-square overflow-hidden bg-[var(--bg-hover)] shadow-sm ${type === "artist" ? "rounded-full" : "rounded-lg"}`}>
          {imageUrl && !imageUrl.endsWith('/placeholder.svg') ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--bg-hover)] to-[var(--border)]">
              <svg className="w-10 h-10 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24">
                {type === "artist" ? (
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                ) : (
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                )}
              </svg>
            </div>
          )}
        </div>
        <div className="absolute bottom-2 right-2 w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>
      <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate">{name}</h3>
      {description && <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-relaxed">{description}</p>}
      {subtext && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtext}</p>}
    </Link>
  )
}
