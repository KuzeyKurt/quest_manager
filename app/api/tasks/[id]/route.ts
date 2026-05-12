import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { ensureTaskDeadlineColumn, prisma } from "@/lib/prisma"

const taskResponseSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  deadline: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  teamId: true,
  assigneeId: true,
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
}

function isMissingTaskDeadlineColumn(error: any): boolean {
  if (error?.code !== "P2022") {
    return false
  }

  const column = String(error?.meta?.column ?? "").toLowerCase()
  const message = String(error?.message ?? "").toLowerCase()

  return (
    column === "deadline" ||
    column.endsWith(".deadline") ||
    message.includes("`deadline` does not exist") ||
    message.includes("column `deadline` does not exist") ||
    message.includes("task.deadline")
  )
}

async function hydrateTaskAssignee<T extends { assigneeId: string | null; teamId: string; assignee: any }>(task: T): Promise<T> {
  if (!task.assigneeId || task.assignee) {
    return task
  }

  const member = await prisma.teamMember.findFirst({
    where: {
      teamId: task.teamId,
      OR: [{ id: task.assigneeId }, { userId: task.assigneeId }],
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

  if (!member) {
    return task
  }

  return { ...task, assignee: member }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTaskDeadlineColumn()

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

    let normalizedAssigneeIds: Array<string | null> | undefined
    if (rawAssigneeId === undefined) {
      normalizedAssigneeIds = undefined
    } else if (!rawAssigneeId) {
      normalizedAssigneeIds = [null]
    } else {
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          teamId: existingTask.teamId,
          OR: [{ id: rawAssigneeId }, { userId: rawAssigneeId }],
        },
        select: { id: true, userId: true },
      })

      // Try both TeamMember.id and User.id to be resilient to old DB constraints.
      if (teamMember) {
        normalizedAssigneeIds = Array.from(new Set([teamMember.id, teamMember.userId]))
      } else {
        normalizedAssigneeIds = [rawAssigneeId]
      }
    }

    const data = {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.deadline !== undefined
        ? {
            deadline:
              body.deadline === null || body.deadline === ""
                ? null
                : typeof body.deadline === "string"
                  ? (() => {
                      const d = new Date(body.deadline)
                      if (Number.isNaN(d.getTime())) {
                        throw new Error("Invalid deadline")
                      }
                      return d
                    })()
                  : null,
          }
        : {}),
    }

    let task
    if (normalizedAssigneeIds === undefined) {
      try {
        task = await prisma.task.update({
          where: { id },
          data,
          select: taskResponseSelect,
        })
      } catch (error: any) {
        if (!isMissingTaskDeadlineColumn(error) || body.deadline === undefined) {
          throw error
        }
        const { deadline: _deadline, ...dataWithoutDeadline } = data
        task = await prisma.task.update({
          where: { id },
          data: dataWithoutDeadline,
          select: taskResponseSelect,
        })
      }
    } else {
      let lastError: any = null
      for (const candidate of normalizedAssigneeIds) {
        try {
          task = await prisma.task.update({
            where: { id },
            data: {
              ...data,
              assigneeId: candidate,
            },
            select: taskResponseSelect,
          })
          break
        } catch (error: any) {
          if (isMissingTaskDeadlineColumn(error) && body.deadline !== undefined) {
            const { deadline: _deadline, ...dataWithoutDeadline } = data
            try {
              task = await prisma.task.update({
                where: { id },
                data: {
                  ...dataWithoutDeadline,
                  assigneeId: candidate,
                },
                select: taskResponseSelect,
              })
              break
            } catch (fallbackError: any) {
              if (fallbackError?.code !== "P2003") {
                throw fallbackError
              }
              lastError = fallbackError
              continue
            }
          }

          if (error?.code !== "P2003") {
            throw error
          }
          lastError = error
        }
      }

      if (!task) {
        if (normalizedAssigneeIds.length === 1 && normalizedAssigneeIds[0] === null) {
          task = await prisma.task.update({
            where: { id },
            data: {
              ...data,
              assigneeId: null,
            },
            select: taskResponseSelect,
          })
        } else if (lastError) {
          throw lastError
        }
      }
    }

    if (!task) {
      return NextResponse.json({ error: "Не удалось обновить исполнителя задачи" }, { status: 400 })
    }

    const hydratedTask = await hydrateTaskAssignee(task)

    return NextResponse.json({ task: hydratedTask })
  } catch (error: any) {
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
