"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskBoard } from "@/components/task-board"
import { TeamMembersPanel } from "@/components/team-members-panel"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { ArrowLeft, BarChart3 } from "lucide-react"
import Link from "next/link"

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
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("board")

  const isAdmin = team.members.find((m) => m.user.id === currentUserId)?.role === "admin"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b pl-20 pr-20">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{team.name}</h1>
            <p className="text-sm text-muted-foreground">{team.description}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
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
            <TaskBoard teamId={team.id} />
          </TabsContent>

          <TabsContent value="members">
            <TeamMembersPanel team={team} isAdmin={isAdmin} currentUserId={currentUserId} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard teamId={team.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
