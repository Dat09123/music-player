/**
 * Connection Quality Utility
 * Wraps the Network Information API (navigator.connection) for SSR-safe access.
 * Falls back gracefully when the API is unavailable.
 */

export type ConnectionQuality = "slow-2g" | "2g" | "3g" | "4g" | "unknown"

export interface ConnectionInfo {
  effectiveType: ConnectionQuality
  downlink: number // Mbps
  rtt: number // ms
  saveData: boolean
  supported: boolean
}

/** Safely read the current connection info. Returns `null` if the API is unavailable. */
export function getConnectionInfo(): ConnectionInfo | null {
  if (typeof navigator === "undefined") return null
  const conn = (navigator as any).connection
  if (!conn) return null

  return {
    effectiveType: (conn.effectiveType as ConnectionQuality) || "unknown",
    downlink: conn.downlink ?? 0,
    rtt: conn.rtt ?? 0,
    saveData: conn.saveData ?? false,
    supported: true,
  }
}

/** Human-readable label for a connection quality */
export function qualityLabel(type: ConnectionQuality): string {
  switch (type) {
    case "4g": return "4G"
    case "3g": return "3G"
    case "2g": return "2G"
    case "slow-2g": return "Slow 2G"
    default: return "Unknown"
  }
}

/** Color class for a connection quality indicator */
export function qualityColor(type: ConnectionQuality): string {
  switch (type) {
    case "4g": return "text-emerald-400"
    case "3g": return "text-amber-400"
    case "2g": return "text-orange-400"
    case "slow-2g": return "text-red-400"
    default: return "text-[var(--text-muted)]"
  }
}

/** Number of signal bars (1-4) for a connection quality */
export function qualityBars(type: ConnectionQuality): number {
  switch (type) {
    case "4g": return 4
    case "3g": return 3
    case "2g": return 2
    case "slow-2g": return 1
    default: return 0
  }
}
