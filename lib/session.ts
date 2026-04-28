import { getSession } from "@/lib/auth"

export async function getSessionUserId() {
  const session = await getSession()
  const userId = session?.userId

  if (!userId) {
    throw new Error("User not authenticated")
  }

  return userId
}