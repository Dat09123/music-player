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
              installing.postMessage({ type: "SKIP_WAITING" })
            }
          })
        })
      } catch {
        // Service worker not supported or registration failed
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
