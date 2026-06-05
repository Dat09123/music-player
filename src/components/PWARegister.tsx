"use client"

import { useEffect } from "react"

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    async function register() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing
          if (!installing) return

          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              console.log("[PWA] New version available, reloading...")
              installing.postMessage({ type: "SKIP_WAITING" })
            }
          })
        })
      } catch (err) {
        console.warn("[PWA] Service worker registration failed:", err)
      }
    }

    register()

    // Reload when a new SW takes over
    const onControllerChange = () => window.location.reload()
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
    }
  }, [])

  return null
}
