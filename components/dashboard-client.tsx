"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamDialog } from "@/components/team-dialog"
import { TeamCard } from "@/components/team-card"
import { Plus, LogOut, Users } from "lucide-react"

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
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams")
      const data = await res.json()
      setTeams(data.teams || [])
    } catch (error) {
      console.error("[v0] Fetch teams error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const handleCreateTeam = async (data: { name: string; description: string }) => {
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const { team } = await res.json()
    setTeams((prev) => [...prev, team])
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <span className="text-xl font-bold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
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
          ) : teams.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No teams yet</CardTitle>
                <CardDescription>Добавьте ваш первый проект, чтобы управлять его задачами</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Дбавьте ваш первый проект
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
