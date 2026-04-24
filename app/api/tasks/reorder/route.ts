import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Пользователь не авторизован" }, { status: 401 })
    }

    const { taskId, newStatus, newOrder } = await request.json()

    if (!taskId || !newStatus || newOrder === undefined) {
      return NextResponse.json({ error: "Пропущены обязательные поля" }, { status: 400 })
    }

    // Обновление статуса задачи
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        order: newOrder,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Ошибка направления задачи:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
