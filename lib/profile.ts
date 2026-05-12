import { getSessionUserId } from "./session"
import { prisma, withPrismaRetry } from "./prisma"

export async function getUserProfile() {
  const userId = await getSessionUserId() // берем текущего пользователя

  const user = await withPrismaRetry(() =>
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        teamMembers: {
          include: {
            team: true,
          },
        },
      },
    }),
  )

  return user
}
