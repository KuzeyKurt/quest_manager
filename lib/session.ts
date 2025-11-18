import { cookies } from "next/headers";

export async function getSessionUserId() {
  const cookieStore = await cookies(); // нужен await
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return userId;
}