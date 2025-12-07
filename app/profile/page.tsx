import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Текущий пользователь
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

  if (!user) {
    redirect("/login");
  }

  return <ProfileClient user={user} />;
}