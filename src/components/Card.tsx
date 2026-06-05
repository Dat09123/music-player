"use client"

import Link from "next/link"
import LazyImage from "./LazyImage"
import { memo } from "react"
import { PlayIcon, MusicNoteIcon, PersonIcon } from "@/components/Icons"

interface CardProps {
  id: string
  name: string
  description?: string
  imageUrl: string
  type: "playlist" | "album" | "artist" | "category"
  href: string
  subtext?: string
}

const Card = memo(function Card({ name, description, imageUrl, type, href, subtext }: CardProps) {
  return (
    <Link href={href} className="group bg-[var(--bg-secondary)]/50 backdrop-blur-sm rounded-xl border border-[var(--border)] p-3 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--accent)]/5 hover:-translate-y-1 hover:border-[var(--accent)]/20">
      <div className="relative mb-3">
        <div className={`w-full aspect-square overflow-hidden bg-[var(--bg-hover)] shadow-sm ${type === "artist" ? "rounded-full" : "rounded-lg"}`}>
          {imageUrl && !imageUrl.endsWith('/placeholder.svg') ? (
            <LazyImage src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--bg-hover)] to-[var(--border)]">
              {type === "artist" ? <PersonIcon className="w-10 h-10 text-[var(--text-muted)]" /> : <MusicNoteIcon className="w-10 h-10 text-[var(--text-muted)]" />}
            </div>
          )}
        </div>
        <div className="absolute bottom-2 right-2 w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
          <PlayIcon className="w-4 h-4 text-white ml-0.5" />
        </div>
      </div>
      <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate">{name}</h3>
      {description && <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-relaxed">{description}</p>}
      {subtext && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtext}</p>}
    </Link>
  )
})

export default Card
