"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Settings,
  Search,
  Menu,
  Bell,
  User,
  ChevronDown,
  Mail,
  Calendar,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CRMLayoutProps {
  children: React.ReactNode
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", active: false },
  { icon: Building2, label: "Companies", href: "/companies", active: true },
  { icon: Users, label: "Contacts", href: "/contacts", active: false },
  { icon: FileText, label: "Deals", href: "/deals", active: false },
  { icon: Mail, label: "Email", href: "/email", active: false },
  { icon: Calendar, label: "Calendar", href: "/calendar", active: false },
  { icon: BarChart3, label: "Analytics", href: "/analytics", active: false },
  { icon: Settings, label: "Settings", href: "/settings", active: false },
]

export function CRMLayout({ children }: CRMLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      <div
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            {sidebarOpen && <span className="font-semibold text-sidebar-foreground text-lg">Velzon</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="px-3 mb-2">
            {sidebarOpen && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</p>
            )}
          </div>
          <div className="space-y-1 px-3">
            {sidebarItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-9 px-3 text-sm font-normal",
                  !sidebarOpen && "px-2 justify-center",
                  item.active
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 w-80 bg-muted/50 border-0 focus:bg-background" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-2 ml-4">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Anna Adame</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  )
}
