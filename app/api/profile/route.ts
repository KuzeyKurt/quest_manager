import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  const userId = await getSessionUserId();
  const { name } = await req.json();

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name },
  });

  return NextResponse.json(updated);
}