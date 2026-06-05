"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, type ReactNode } from "react"

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [state, setState] = useState<"enter" | "exit">("enter")
  const prevPathRef = useRef(pathname)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pathname === prevPathRef.current) {
      // First mount or same path — just show
      setState("enter")
      return
    }

    prevPathRef.current = pathname

    if (timerRef.current) clearTimeout(timerRef.current)

    // Exit
    setState("exit")
    timerRef.current = setTimeout(() => {
      // Enter
      setState("enter")
      timerRef.current = null
    }, 150)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  return (
    <div
      className={
        state === "enter" ? "animate-page-enter" : "animate-page-exit"
      }
    >
      {children}
    </div>
  )
}
