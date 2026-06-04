"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, type ReactNode } from "react"

type TransitionState = "enter" | "exit" | "idle"

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionState, setTransitionState] = useState<TransitionState>("enter")
  const prevPathRef = useRef(pathname)
  const mountedRef = useRef(false)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup all timers helper
  function clearAllTimers() {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current)
      exitTimerRef.current = null
    }
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current)
      enterTimerRef.current = null
    }
  }

  useEffect(() => {
    // On first mount — animate in
    if (!mountedRef.current) {
      mountedRef.current = true
      const timer = setTimeout(() => setTransitionState("idle"), 400)
      return () => clearTimeout(timer)
    }

    // Only animate on actual route change
    if (pathname === prevPathRef.current) return

    prevPathRef.current = pathname
    clearAllTimers()

    // Start exit animation
    setTransitionState("exit")

    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null
      // Swap to new children
      setDisplayChildren(children)
      setTransitionState("enter")

      enterTimerRef.current = setTimeout(() => {
        enterTimerRef.current = null
        setTransitionState("idle")
      }, 400)
    }, 200)

    return clearAllTimers
  }, [pathname, children])

  const className =
    transitionState === "exit"
      ? "animate-page-exit"
      : transitionState === "enter"
      ? "animate-page-enter"
      : ""

  return (
    <div className={className} style={transitionState === "idle" ? { opacity: 1 } : undefined}>
      {displayChildren}
    </div>
  )
}
