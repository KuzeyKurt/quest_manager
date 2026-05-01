"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskBoard } from "@/components/task-board"
import { TeamMembersPanel } from "@/components/team-members-panel"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { ArrowLeft, BarChart3 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Team {
  id: string
  name: string
  description: string | null
  creatorId: string
  creator: {
    id: string
    name: string
    email: string
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
}

interface TeamPageClientProps {
  team: Team
  currentUserId: string
}

export function TeamPageClient({ team, currentUserId }: TeamPageClientProps) {
  const [activeTab, setActiveTab] = useState("board")
  const [teamState, setTeamState] = useState<Team>(team)
  const [editOpen, setEditOpen] = useState(false)
  const [draftName, setDraftName] = useState(team.name)
  const [draftDescription, setDraftDescription] = useState(team.description ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const isAdmin = teamState.members.find((m) => m.user.id === currentUserId)?.role === "admin"

  const openEdit = () => {
    setError("")
    setDraftName(teamState.name)
    setDraftDescription(teamState.description ?? "")
    setEditOpen(true)
  }

  const saveTeam = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/teams/${teamState.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draftName,
          description: draftDescription || null,
        }),
      })
      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || "Не удалось сохранить изменения")
      }
      if (!payload?.team) {
        throw new Error("Сервер вернул некорректный ответ")
      }
      setTeamState(payload.team)
      setEditOpen(false)
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить изменения")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        {/* <SidebarTrigger /> */}
        <div className="container flex flex-1 items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{teamState.name}</h1>
            <p className="text-sm text-muted-foreground">{teamState.description}</p>
          </div>
          <div>
            {isAdmin ? <Button onClick={openEdit}>Редактировать доску</Button> : null}
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="board">Доска задач</TabsTrigger>
            <TabsTrigger value="members">Участники</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board">
            <TaskBoard teamId={teamState.id} teamMembers={teamState.members} />
          </TabsContent>

          <TabsContent value="members">
            <TeamMembersPanel team={teamState} isAdmin={isAdmin} currentUserId={currentUserId} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard teamId={teamState.id} />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Редактировать проект</DialogTitle>
            <DialogDescription>Измените название и описание проекта.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error ? (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="team-name">Название</Label>
              <Input
                id="team-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">Описание</Label>
              <Textarea
                id="team-description"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                disabled={saving}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Отмена
            </Button>
            <Button onClick={saveTeam} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
