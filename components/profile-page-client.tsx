"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAvatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProfileUser = {
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
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

function broadcastUserUpdate(user: unknown) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("qm-user-updated", { detail: user }))
}

export function ProfilePageClient({
  user,
  stats,
}: {
  user: ProfileUser
  stats: ProfileStats
}) {
  const [profile, setProfile] = useState<ProfileUser>(user)
  const [activeDays, setActiveDays] = useState<number>(1)
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(user.name)
  const [draftEmail, setDraftEmail] = useState(user.email)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>("")
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setProfile(user)
    setDraftName(user.name)
    setDraftEmail(user.email)
  }, [user])

  const openAvatarPicker = () => {
    setAvatarError("")
    fileInputRef.current?.click()
  }

  const uploadAvatar = async (file: File) => {
    setAvatarBusy(true)
    setAvatarError("")
    try {
      const fd = new FormData()
      fd.set("file", file)
      const res = await fetch("/api/auth/me/avatar", {
        method: "POST",
        body: fd,
        credentials: "include",
      })
      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || "Не удалось загрузить аватар")
      }
      if (!payload?.user) {
        throw new Error("Сервер вернул некорректный ответ")
      }
      const u = payload.user
      setProfile((prev) => ({
        ...prev,
        avatarUrl: u.avatarUrl ?? null,
        updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : prev.updatedAt,
      }))
      broadcastUserUpdate(payload.user)
    } catch (e: unknown) {
      setAvatarError(e instanceof Error ? e.message : "Не удалось загрузить аватар")
    } finally {
      setAvatarBusy(false)
    }
  }

  const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    await uploadAvatar(file)
  }

  const removeAvatar = async () => {
    setAvatarBusy(true)
    setAvatarError("")
    try {
      const res = await fetch("/api/auth/me/avatar", {
        method: "DELETE",
        credentials: "include",
      })
      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || "Не удалось удалить аватар")
      }
      if (!payload?.user) {
        throw new Error("Сервер вернул некорректный ответ")
      }
      const u = payload.user
      setProfile((prev) => ({
        ...prev,
        avatarUrl: u.avatarUrl ?? null,
        updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : prev.updatedAt,
      }))
      broadcastUserUpdate(payload.user)
    } catch (e: unknown) {
      setAvatarError(e instanceof Error ? e.message : "Не удалось удалить аватар")
    } finally {
      setAvatarBusy(false)
    }
  }

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
        avatarUrl: payload.user.avatarUrl ?? null,
        createdAt: payload.user.createdAt,
        updatedAt: payload.user.updatedAt
          ? new Date(payload.user.updatedAt).toISOString()
          : profile.updatedAt,
      })
      broadcastUserUpdate(payload.user)
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
            <CardContent className="flex w-full flex-wrap items-start gap-4 p-6 sm:items-center">
              <div className="flex shrink-0 flex-col items-center gap-2 sm:items-start">
                <UserAvatar
                  className="h-16 w-16"
                  name={profile.name}
                  imageUrl={profile.avatarUrl}
                  imageCacheKey={profile.updatedAt}
                  fallbackClassName="bg-violet-600 text-lg font-semibold"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  tabIndex={-1}
                  onChange={onAvatarFileChange}
                />
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={avatarBusy || saving}
                    onClick={openAvatarPicker}
                  >
                    {avatarBusy ? "Подождите..." : "Загрузить фото"}
                  </Button>
                  {profile.avatarUrl ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      disabled={avatarBusy || saving}
                      onClick={removeAvatar}
                    >
                      Удалить фото
                    </Button>
                  ) : null}
                </div>
                {avatarError ? (
                  <p className="max-w-[220px] text-center text-xs text-destructive sm:text-left">{avatarError}</p>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
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

