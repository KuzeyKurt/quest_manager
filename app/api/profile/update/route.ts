import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    const { name } = await req.json();

    if (!name || name.trim().length < 2) {
      return new Response("Invalid name", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    return Response.json(updatedUser);
  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }
}