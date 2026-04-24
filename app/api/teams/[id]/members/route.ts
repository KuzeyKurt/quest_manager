import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Пользователь не авторизован" }, { status: 401 })
    }

    const { id } = await params
    const { email, role } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Электронная почта обязательна" }, { status: 400 })
    }

    // Проверка на то, что пользователь является админом
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: session.userId,
        role: "admin",
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Только администратор может добавить участниковк команды." }, { status: 403 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Проверка того, что пользователь уже добавлен в проект
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId: id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: "Пользователь уже является участником" }, { status: 400 })
    }

    // Add member
    const member = await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: id,
        role: role || "участник",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error("[v0] Ошибка при добавлении пользователя:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")

    if (!memberId) {
      return NextResponse.json({ error: "ID участника обязательно." }, { status: 400 })
    }

    // Check if user is admin
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: session.userId,
        role: "admin",
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Только администратор может удалить пользователей из проекта." }, { status: 403 })
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Remove member error:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
