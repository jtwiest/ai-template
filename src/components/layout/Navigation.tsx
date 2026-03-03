"use client"

import Link from "next/link"

export function Navigation() {
  return (
    <nav className="fixed left-0 top-0 h-screen w-16 border-r border-border bg-card flex flex-col items-center py-6 gap-2">
      {/* Logo / Brand */}
      <Link
        href="/"
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
        title="AirSenseAI"
      >
        AI
      </Link>
    </nav>
  )
}
