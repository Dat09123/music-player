/**
 * Format milliseconds to mm:ss
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US")
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + "..."
}

/**
 * Get the best image from Spotify images array
 */
export function getImage(images: { url: string; height: number | null; width: number | null }[] | undefined, size: "sm" | "md" | "lg" = "md"): string {
  if (!images || images.length === 0) return "/placeholder.svg"
  const sizes = { sm: 0, md: Math.floor(images.length / 2), lg: images.length - 1 }
  return images[sizes[size]]?.url || images[0]?.url || "/placeholder.svg"
}

/**
 * Format artist names string
 */
export function formatArtists(artists: { id: string; name: string }[]): string {
  return artists.map((a) => a.name).join(", ")
}

/**
 * Format date string
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

/**
 * Format a timestamp into a human-readable relative time string
 */
export function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/**
 * Get genre emoji
 */
export function getGenreIcon(genre: string): string {
  const icons: Record<string, string> = {
    pop: "🎤",
    rock: "🎸",
    hip: "🎧",
    rap: "🎧",
    jazz: "🎷",
    classical: "🎻",
    electronic: "🎹",
    dance: "💃",
    rnb: "🎵",
    soul: "🎵",
    reggae: "🌴",
    blues: "🎸",
    country: "🤠",
    metal: "🤘",
    indie: "🎸",
    folk: "🪕",
    latin: "💃",
    ambient: "🌌",
    punk: "🤘",
    funk: "🎸",
    gospel: "🙏",
    "k-pop": "🇰🇷",
  }
  for (const [key, icon] of Object.entries(icons)) {
    if (genre.toLowerCase().includes(key)) return icon
  }
  return "🎵"
}
