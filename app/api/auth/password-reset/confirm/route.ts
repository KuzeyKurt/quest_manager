import { NextResponse } from "next/server"
import { getSession, hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MOCK_CODE = "55555"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const code = typeof body?.code === "string" ? body.code.trim() : ""
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : ""

    if (!code || !newPassword) {
      return NextResponse.json({ error: "Code and newPassword are required" }, { status: 400 })
    }
    if (code !== MOCK_CODE) {
      return NextResponse.json({ error: "Неверный код" }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Пароль должен быть минимум 6 символов" }, { status: 400 })
    }

    const hashed = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashed },
      select: { id: true },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Password reset confirm error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

