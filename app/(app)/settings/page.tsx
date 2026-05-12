import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { isTransientPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma"
import { SettingsPageClient } from "@/components/settings-page-client"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  let user: { id: string; email: string; name: string } | null = null
  try {
    user = await withPrismaRetry(() =>
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, email: true, name: true },
      }),
    )
  } catch (error) {
    if (!isTransientPrismaConnectionError(error)) {
      throw error
    }
  }

  if (!user) {
    redirect("/login")
  }

  return <SettingsPageClient user={user} />
}

