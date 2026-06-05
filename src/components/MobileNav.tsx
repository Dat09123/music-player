"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, SearchIcon, ChartIcon } from "@/components/Icons"

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/me/top", label: "Charts", icon: ChartIcon },
  { href: "/me/liked", label: "Trending", icon: ChartIcon },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-secondary)] border-t border-[var(--border)] safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-0 ${isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-[var(--accent)]" : ""}`} />
              <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
