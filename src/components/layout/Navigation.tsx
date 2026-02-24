"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageSquare, FileText, Workflow, Home } from "lucide-react"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Artifacts",
    href: "/artifacts",
    icon: FileText,
  },
  {
    name: "Workflows",
    href: "/workflows",
    icon: Workflow,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 h-screen w-16 border-r border-border bg-card flex flex-col items-center py-6 gap-2">
      {/* Logo / Brand */}
      <Link
        href="/"
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
        title="AI MVP"
      >
        AI
      </Link>

      {/* Navigation Items */}
      <div className="flex flex-col gap-2 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              className={cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />

              {/* Tooltip on hover */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-border">
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
