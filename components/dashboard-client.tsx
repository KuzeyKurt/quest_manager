"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamDialog } from "@/components/team-dialog"
import { TeamCard } from "@/components/team-card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Plus } from "lucide-react"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"
import { redirectToLoginPreservingReturn } from "@/lib/redirect-login"

interface User {
  id: string
  name: string
  email: string
}

interface Team {
  id: string
  name: string
  description: string | null
  creator: {
    id: string
    name: string
  }
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  _count: {
    tasks: number
    members: number
  }
}

export function DashboardClient({ user }: { user: User }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    void fetchTeams()
  }, [])

  const fetchTeams = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetchWithTimeout("/api/teams", { method: "GET" })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        if (res.status === 401) {
          redirectToLoginPreservingReturn()
          return
        }
        const msg =
          data && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Не удалось загрузить проекты"
        setTeams([])
        setFetchError(msg)
        return
      }
      setTeams(Array.isArray((data as { teams?: unknown })?.teams) ? (data as { teams: Team[] }).teams : [])
    } catch (error: unknown) {
      const name = typeof error === "object" && error && "name" in error ? (error as Error).name : ""
      setTeams([])
      setFetchError(
        name === "AbortError"
          ? "Сервер не ответил за отведённое время. Проверьте БД или перезапустите dev-сервер."
          : error instanceof Error
            ? error.message
            : "Не удалось загрузить проекты",
      )
      console.error("[v0] Fetch teams error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async (data: { name: string; description: string }) => {
    const res = await fetchWithTimeout("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const payload = await res.json()
    if (!res.ok) {
      throw new Error(payload?.error || "Не удалось создать проект")
    }

    const team = payload?.team
    if (!team) {
      throw new Error("Сервер вернул некорректный ответ")
    }

    setTeams((prev) => [...prev, team])
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        {/* <SidebarTrigger /> */}
      </header>

      <main className="container mx-auto flex-1 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Ваши проекты</h1>
              <p className="text-muted-foreground">Управляйте вашими проектами и работайте вместе с командой над задачами</p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить проект
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Загрузка проектов...</p>
            </div>
          ) : fetchError ? (
            <div className="rounded-md border border-destructive/25 bg-destructive/10 p-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-destructive">{fetchError}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void fetchTeams()}>
                Повторить
              </Button>
            </div>
          ) : teams.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No teams yet</CardTitle>
                <CardDescription>Добавьте ваш первый проект, чтобы управлять его задачами</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавьте ваш первый проект
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} currentUserId={user.id} onUpdate={fetchTeams} />
              ))}
            </div>
          )}
        </div>
      </main>

      <TeamDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleCreateTeam} />
    </div>
  )
}
