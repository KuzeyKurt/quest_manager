import { PrismaClient} from "@prisma/client"
import { getSessionUserId } from "./session"

const prisma = new PrismaClient();

export async function getUserProfile() {
  const userId = await getSessionUserId(); // берем текущего пользователя

  const user = await prisma.user.findUnique({
    where: { id: userId },
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