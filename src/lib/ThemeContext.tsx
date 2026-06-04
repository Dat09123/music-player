"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark"

const ACCENT_COLORS = [
  { name: "Indigo", light: "#4f46e5", dark: "#6366f1" },
  { name: "Violet", light: "#7c3aed", dark: "#8b5cf6" },
  { name: "Pink",   light: "#db2777", dark: "#ec4899" },
  { name: "Rose",   light: "#e11d48", dark: "#f43f5e" },
  { name: "Orange", light: "#ea580c", dark: "#f97316" },
  { name: "Green",  light: "#16a34a", dark: "#22c55e" },
  { name: "Teal",   light: "#0d9488", dark: "#14b8a6" },
  { name: "Sky",    light: "#0284c7", dark: "#0ea5e9" },
]

export { ACCENT_COLORS }

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  accentIndex: number
  setAccentIndex: (i: number) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = "muse-theme"
const ACCENT_KEY = "muse-accent"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "dark" || stored === "light") return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getInitialAccent(): number {
  if (typeof window === "undefined") return 0
  const stored = localStorage.getItem(ACCENT_KEY)
  const idx = stored ? parseInt(stored) : 0
  return isNaN(idx) ? 0 : Math.min(idx, ACCENT_COLORS.length - 1)
}

function applyAccent(index: number, theme: Theme) {
  const color = ACCENT_COLORS[index]
  const value = theme === "dark" ? color.dark : color.light
  const root = document.documentElement
  root.style.setProperty("--accent", value)
  // Update glow color too
  root.style.setProperty("--accent-glow", `${value}4d`)
  root.style.setProperty("--shadow-glow", `0 0 20px ${value}26`)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)
  const [accentIndex, setAccentIndexState] = useState(0)

  useEffect(() => {
    const t = getInitialTheme()
    const a = getInitialAccent()
    setThemeState(t)
    setAccentIndexState(a)
    setMounted(true)
    applyAccent(a, t)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    localStorage.setItem(STORAGE_KEY, theme)
    applyAccent(accentIndex, theme)
  }, [theme, mounted, accentIndex])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) setThemeState(e.matches ? "dark" : "light")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  function setTheme(t: Theme) { setThemeState(t) }
  function toggleTheme() { setThemeState((prev) => (prev === "dark" ? "light" : "dark")) }
  function setAccentIndex(i: number) {
    setAccentIndexState(i)
    localStorage.setItem(ACCENT_KEY, String(i))
    applyAccent(i, theme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, accentIndex, setAccentIndex }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
