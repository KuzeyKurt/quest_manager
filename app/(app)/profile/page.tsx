import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/session"
import { ProfilePageClient } from "@/components/profile-page-client"

export default async function ProfilePage() {
  const userId = await getSessionUserId()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  const projectsCount = await prisma.team.count({
    where: {
      OR: [{ creatorId: userId }, { members: { some: { userId } } }],
    },
  })

  const tasksAdded = await prisma.task.count({
    where: { userId },
  })

  const tasksAssigned = await prisma.task.count({
    where: { assignee: { userId } },
  })

  const tasksCompleted = await prisma.task.count({
    where: { assignee: { userId }, status: "complete" },
  })

  return (
    <ProfilePageClient
      user={{
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      }}
      stats={{
        projectsCount,
        completedTasks: tasksCompleted,
        tasksAdded,
        tasksAssigned,
        tasksCompleted,
      }}
    />
  )
}