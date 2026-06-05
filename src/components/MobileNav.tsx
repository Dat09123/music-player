"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, SearchIcon, ChartIcon, ClockIcon, MusicNoteIcon } from "@/components/Icons"

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/stations", label: "Stations", icon: MusicNoteIcon },
  { href: "/me/top", label: "Charts", icon: ChartIcon },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-t border-[var(--border)] safe-area-bottom" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-0 ${
                isActive
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] active:scale-95"
              }`}
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[var(--accent)] rounded-full" />
              )}
              <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-medium truncate max-w-full transition-all duration-200 ${isActive ? "opacity-100" : "opacity-70"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
