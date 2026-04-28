import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TeamPageClient } from "@/components/team-page-client"

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const { id } = await params

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!team) {
    redirect("/dashboard")
  }

  // Check if user is a member
  const isMember = team.members.some((m) => m.userId === session.userId)
  if (!isMember && team.creatorId !== session.userId) {
    redirect("/dashboard")
  }

  return <TeamPageClient team={team} currentUserId={session.userId} />
}
