// components/app-sidebar.tsx
'use client'

import Link from "next/link"
import { Home, Settings, HelpCircle, LogOut, ChevronLeft } from "lucide-react"
import { useEffect, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { UserAvatar } from "@/components/ui/avatar"

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me', { 
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user || data))
      .catch(err => console.error("Failed to fetch user:", err))
  }, [])

  useEffect(() => {
    const onUserUpdated = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail
      if (detail && typeof detail === "object") {
        setUser(detail as Record<string, unknown>)
      }
    }
    window.addEventListener("qm-user-updated", onUserUpdated)
    return () => window.removeEventListener("qm-user-updated", onUserUpdated)
  }, [])

  const rawName = user?.name || user?.username || "Diana Azamatova"
  const displayName = typeof rawName === "string" ? rawName.trim() : "Diana Azamatova"

  const avatarUrl =
    typeof user?.avatarUrl === "string" && user.avatarUrl.length > 0 ? user.avatarUrl : null
  const imageCacheKey =
    user?.updatedAt != null
      ? typeof user.updatedAt === "string"
        ? user.updatedAt
        : new Date(user.updatedAt as string | number | Date).toISOString()
      : null

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        {/* Верхняя часть: Кнопка + Логотип */}
        <div className="px-4 py-6 flex items-center gap-3">
          {state !== "collapsed" && (
            <SidebarMenuButton 
              onClick={toggleSidebar}
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </SidebarMenuButton>
          )}

          <div 
            className="flex-1 flex items-center justify-center cursor-pointer"
            onClick={toggleSidebar}
          >
            {state === "collapsed" ? (
              <div className="text-2xl font-bold text-violet-500">TF</div>
            ) : (
              <span className="text-3xl font-bold tracking-tight text-violet-500">
                TaskForce
              </span>
            )}
          </div>
        </div>

        {/* Основное меню */}
        <SidebarMenu className="px-3 space-y-1 mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <Home className="h-5 w-5" />
                <span>Мои проекты</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span>Настройки</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/help">
                <HelpCircle className="h-5 w-5" />
                <span>Помощь</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border p-4">
        <div className="flex flex-col gap-2">
          {state !== "collapsed" && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => window.location.href = '/profile'} >
              <UserAvatar
                className="h-11 w-11 shrink-0"
                name={displayName}
                imageUrl={avatarUrl}
                imageCacheKey={imageCacheKey}
                fallbackClassName="bg-violet-600 text-base font-semibold"
              />

              <div className="flex flex-col min-w-0">
                <p className="font-medium text-sm truncate">{displayName}</p>
              </div>
            </div>
          )}

          <SidebarMenuButton 
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { 
                  method: 'POST',
                  credentials: 'include' 
                })
                window.location.href = '/login'   
              } catch (error) {
                console.error('Logout error:', error)
                window.location.href = '/login'
              }
            }}
            className="w-full justify-center text-muted-foreground hover:text-violet-500 hover:bg-violet-950/50"
            size={state === "collapsed" ? "icon" : "default"}
          >
            <LogOut className="h-5 w-5" />
            {state !== "collapsed" && <span className="ml-2">Выход</span>}
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}