export interface LyricLine {
  time: number // seconds
  text: string
}

export interface LyricsResult {
  synced: LyricLine[]
  plain: string | null
  source: "synced" | "plain" | null
}

/** Parse LRC format: [mm:ss.xx] or [mm:ss.xxx] line text */
export function parseLRC(lrc: string): LyricLine[] {
  const lines: LyricLine[] = []
  const regex = /\[(\d{1,3}):(\d{2})(?:\.(\d{2,3}))?\](.*)/
  
  for (const line of lrc.split("\n")) {
    const match = line.match(regex)
    if (!match) continue
    const minutes = parseInt(match[1], 10)
    const seconds = parseInt(match[2], 10)
    let millis = parseInt(match[3] || "0", 10)
    // If 2-digit millis, convert to seconds (e.g. 12 → 0.12)
    if (match[3] && match[3].length === 2) millis *= 10
    const time = minutes * 60 + seconds + millis / 1000
    const text = match[4].trim()
    if (text) lines.push({ time, text })
  }

  return lines.sort((a, b) => a.time - b.time)
}

/** Fetch lyrics for a track from the LRCLIB API */
export async function fetchLyrics(artist: string, track: string): Promise<LyricsResult> {
  try {
    const params = new URLSearchParams()
    if (artist) params.set("artist", artist)
    if (track) params.set("track", track)

    const res = await fetch(`/api/lyrics?${params.toString()}`)
    if (!res.ok) return { synced: [], plain: null, source: null }

    const data = await res.json()
    const result: any = data.result

    if (!result) return { synced: [], plain: null, source: null }

    if (result.syncedLyrics) {
      return {
        synced: parseLRC(result.syncedLyrics),
        plain: result.plainLyrics || null,
        source: "synced",
      }
    }

    if (result.plainLyrics) {
      return {
        synced: [],
        plain: result.plainLyrics,
        source: "plain",
      }
    }

    return { synced: [], plain: null, source: null }
  } catch {
    return { synced: [], plain: null, source: null }
  }
}

/** Get current line index for a given progress time (binary search for speed) */
export function getCurrentLineIndex(lines: LyricLine[], time: number): number {
  if (lines.length === 0) return -1
  // The lineRef may be several lines behind/past, but binary search is fine
  // since lines.length is small (< 200 for most songs)
  let lo = 0
  let hi = lines.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (lines[mid].time <= time) {
      ans = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return ans
}
