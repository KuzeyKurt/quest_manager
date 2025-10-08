"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, CheckSquare, Settings } from "lucide-react"

interface Team {
  id: string
  name: string
  description: string | null
  creator: {
    id: string
    name: string
  }
  _count: {
    tasks: number
    members: number
  }
}

interface TeamCardProps {
  team: Team
  currentUserId: string
  onUpdate: () => void
}

export function TeamCard({ team, currentUserId }: TeamCardProps) {
  const router = useRouter()
  const isCreator = team.creator.id === currentUserId

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/teams/${team.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{team.name}</CardTitle>
            <CardDescription className="line-clamp-2">{team.description || "No description"}</CardDescription>
          </div>
          {isCreator && (
            <Badge variant="secondary" className="ml-2">
              Owner
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{team._count.members} members</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckSquare className="h-4 w-4" />
            <span>{team._count.tasks} tasks</span>
          </div>
        </div>
        <Button className="w-full mt-4" onClick={() => router.push(`/teams/${team.id}`)}>
          <Settings className="h-4 w-4 mr-2" />
          Open Team
        </Button>
      </CardContent>
    </Card>
  )
}
