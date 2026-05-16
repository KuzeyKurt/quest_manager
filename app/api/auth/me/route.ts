import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

    if (!name || !email) {
      return NextResponse.json({ error: "Имя и электронная почта обязательны" }, { status: 400 })
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingByEmail && existingByEmail.id !== session.userId) {
      return NextResponse.json({ error: "Эта электронная почта уже используется" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { name, email },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
