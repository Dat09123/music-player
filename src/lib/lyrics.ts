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
    const res = await fetch(
      `/api/lyrics?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`
    )
    if (!res.ok) return { synced: [], plain: null, source: null }

    const data = await res.json()
    const results: any[] = data.results || []

    // Look for a result that has synced lyrics first
    const syncedResult = results.find((r: any) => r.syncedLyrics)
    if (syncedResult) {
      return {
        synced: parseLRC(syncedResult.syncedLyrics),
        plain: syncedResult.plainLyrics || null,
        source: "synced",
      }
    }

    // Fall back to plain lyrics
    const plainResult = results.find((r: any) => r.plainLyrics)
    if (plainResult) {
      return {
        synced: [],
        plain: plainResult.plainLyrics,
        source: "plain",
      }
    }

    return { synced: [], plain: null, source: null }
  } catch {
    return { synced: [], plain: null, source: null }
  }
}

/** Get current line index for a given progress time */
export function getCurrentLineIndex(lines: LyricLine[], time: number): number {
  if (lines.length === 0) return -1
  // Find the last line whose time is <= current time
  let idx = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= time) idx = i
    else break
  }
  return idx
}
