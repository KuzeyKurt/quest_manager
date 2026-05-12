import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Mock flow: we "send" a code to email. For safety, only allow current user's email.
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    if (user.email.toLowerCase() !== email) {
      return NextResponse.json({ error: "Email does not match current account" }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      message: "Код для смены пароля отправлен на почту (мок).",
    })
  } catch (error) {
    console.error("[v0] Password reset request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

