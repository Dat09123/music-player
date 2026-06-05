/**
 * useConnectionQuality — React hook that tracks navigator.connection changes.
 * Updates automatically when the connection quality changes.
 */

import { useState, useEffect } from "react"
import {
  getConnectionInfo,
  type ConnectionInfo,
} from "@/lib/connection"

export function useConnectionQuality(): {
  info: ConnectionInfo | null
  online: boolean
} {
  const [info, setInfo] = useState<ConnectionInfo | null>(() => getConnectionInfo())
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  )

  useEffect(() => {
    // Initial state
    setInfo(getConnectionInfo())
    setOnline(navigator.onLine)

    // Listen for connection quality changes (Chromium only)
    const conn = (navigator as any).connection
    const onQualityChange = () => setInfo(getConnectionInfo())
    if (conn) conn.addEventListener("change", onQualityChange)

    // Listen for online/offline events
    const goOnline = () => { setOnline(true); setInfo(getConnectionInfo()) }
    const goOffline = () => { setOnline(false) }
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)

    return () => {
      if (conn) conn.removeEventListener("change", onQualityChange)
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  return { info, online }
}
