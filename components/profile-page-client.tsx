"use client"

import { useEffect, useMemo, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const [profile, setProfile] = useState<ProfileUser>(user)
  const initials = useMemo(() => calcInitials(profile.name), [profile.name])
  const [activeDays, setActiveDays] = useState<number>(1)
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(user.name)
  const [draftEmail, setDraftEmail] = useState(user.email)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    setProfile(user)
    setDraftName(user.name)
    setDraftEmail(user.email)
  }, [user])

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

  const startEditing = () => {
    setError("")
    setDraftName(profile.name)
    setDraftEmail(profile.email)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setError("")
    setDraftName(profile.name)
    setDraftEmail(profile.email)
    setIsEditing(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draftName, email: draftEmail }),
      })
      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || "Не удалось сохранить профиль")
      }
      if (!payload?.user) {
        throw new Error("Сервер вернул некорректный ответ")
      }
      setProfile({
        name: payload.user.name,
        email: payload.user.email,
        createdAt: payload.user.createdAt,
      })
      setIsEditing(false)
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить профиль")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        {/* <SidebarTrigger /> */}
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
                <div className="truncate text-2xl font-bold">{profile.name}</div>
                <div className="mt-1 truncate text-sm text-muted-foreground">{profile.email}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Дата регистрации: {formatDate(profile.createdAt)}
                </div>
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-2">
                {!isEditing ? (
                  <Button variant="outline" onClick={startEditing}>
                    Редактировать
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                      Отмена
                    </Button>
                    <Button onClick={saveProfile} disabled={saving}>
                      {saving ? "Сохранение..." : "Сохранить"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {isEditing ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Редактирование профиля</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error ? (
                  <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="profile-name">Имя</Label>
                  <Input
                    id="profile-name"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Электронная почта</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={draftEmail}
                    onChange={(e) => setDraftEmail(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

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

