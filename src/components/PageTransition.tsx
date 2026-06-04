"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, type ReactNode } from "react"

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const prevPathRef = useRef(pathname)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pathname === prevPathRef.current) return
    prevPathRef.current = pathname

    if (timerRef.current) clearTimeout(timerRef.current)

    setVisible(false)
    timerRef.current = setTimeout(() => {
      setVisible(true)
      timerRef.current = null
    }, 150)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      {children}
    </div>
  )
}
