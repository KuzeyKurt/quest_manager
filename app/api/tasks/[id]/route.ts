import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Пользователь не авторизован" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const existingTask = await prisma.task.findUnique({
      where: { id },
      select: { id: true, teamId: true, assigneeId: true },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const rawAssigneeId =
      body.assigneeId === undefined
        ? undefined
        : typeof body.assigneeId === "string"
          ? body.assigneeId.trim()
          : ""

    let normalizedAssigneeId: string | null | undefined
    if (rawAssigneeId === undefined) {
      normalizedAssigneeId = undefined
    } else if (!rawAssigneeId) {
      normalizedAssigneeId = null
    } else {
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          teamId: existingTask.teamId,
          OR: [{ id: rawAssigneeId }, { userId: rawAssigneeId }],
        },
        select: { id: true },
      })

      // If stale/invalid assignee comes from client, clear assignment
      // instead of attempting to connect an invalid FK value.
      normalizedAssigneeId = teamMember?.id ?? null
    }

    const data = {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(normalizedAssigneeId !== undefined
        ? {
            assignee: normalizedAssigneeId
              ? { connect: { id: normalizedAssigneeId } }
              : { disconnect: true },
          }
        : {}),
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ task })
  } catch (error: any) {
    if (error?.code === "P2003") {
      return NextResponse.json({ error: "Failed to update task assignee" }, { status: 400 })
    }
    console.error("[v0] Ошибка обновления задачи:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Пользователь не авторизован" }, { status: 401 })
    }

    const { id } = await params

    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Ошибка удаления задачи:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
