import { prisma } from "./prisma"
import { getSession } from "./auth"

export async function getUserProfile() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      teamMembers: {
        include: {
          team: true,
        },
      },
    },
  });

  return user;
}