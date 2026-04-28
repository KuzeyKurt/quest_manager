"use client"

import { useEffect, useMemo, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type ProfileUser = {
  name: string
  email: string
  createdAt: string
}

type ProfileStats = {
  projectsCount: number
  completedTasks: number
  tasksAdded: number
  tasksAssigned: number
  tasksCompleted: number
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString()
}

function calcInitials(name: string) {
  const cleaned = (name || "").trim()
  if (!cleaned) return "?"
  return cleaned
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ProfilePageClient({
  user,
  stats,
}: {
  user: ProfileUser
  stats: ProfileStats
}) {
  const initials = useMemo(() => calcInitials(user.name), [user.name])
  const [activeDays, setActiveDays] = useState<number>(1)

  useEffect(() => {
    const key = "qm_active_since"
    const now = Date.now()

    const existing = window.localStorage.getItem(key)
    const since = existing ? Number(existing) : NaN

    const start = Number.isFinite(since) ? since : now
    if (!Number.isFinite(since)) {
      window.localStorage.setItem(key, String(now))
    }

    const days = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1)
    setActiveDays(days)
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="flex w-full items-center gap-4 p-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-violet-600 text-lg font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="truncate text-2xl font-bold">{user.name}</div>
                <div className="mt-1 truncate text-sm text-muted-foreground">
                  {user.email}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Дата регистрации: {formatDate(user.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Проекты
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{stats.projectsCount}</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Завершённые задачи
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{stats.completedTasks}</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Активные дни
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{activeDays}</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Статистика задач
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Добавлено</span>
                  <span className="font-semibold text-foreground">{stats.tasksAdded}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Назначено</span>
                  <span className="font-semibold text-foreground">{stats.tasksAssigned}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Завершено</span>
                  <span className="font-semibold text-foreground">{stats.tasksCompleted}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

