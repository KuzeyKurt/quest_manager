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

async function hydrateTaskAssignees<T extends { assigneeId: string | null; teamId: string; assignee: any }>(tasks: T[]): Promise<T[]> {
  const unresolved = tasks.filter((task) => task.assigneeId && !task.assignee)
  if (unresolved.length === 0) {
    return tasks
  }

  const teamId = unresolved[0]?.teamId
  const assigneeIds = Array.from(new Set(unresolved.map((task) => task.assigneeId).filter(Boolean) as string[]))
  if (!teamId || assigneeIds.length === 0) {
    return tasks
  }

  const members = await prisma.teamMember.findMany({
    where: {
      teamId,
      OR: [{ id: { in: assigneeIds } }, { userId: { in: assigneeIds } }],
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

  const memberByKey = new Map<string, (typeof members)[number]>()
  for (const member of members) {
    memberByKey.set(member.id, member)
    memberByKey.set(member.userId, member)
  }

  return tasks.map((task) => {
    if (task.assignee || !task.assigneeId) {
      return task
    }
    const fallbackAssignee = memberByKey.get(task.assigneeId)
    if (!fallbackAssignee) {
      return task
    }
    return { ...task, assignee: fallbackAssignee }
  })
}

export async function GET(request: NextRequest) {
  try {
    await ensureTaskDeadlineColumn()

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")

    if (!teamId) {
      return NextResponse.json({ error: "Team ID required" }, { status: 400 })
    }

    const tasks = await prisma.task.findMany({
      where: { teamId },
      select: taskResponseSelect,
      orderBy: { order: "asc" },
    })

    const hydratedTasks = await hydrateTaskAssignees(tasks)

    return NextResponse.json({ tasks: hydratedTasks })
  } catch (error) {
    console.error("[v0] Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTaskDeadlineColumn()

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, teamId, priority, status, assigneeId, deadline } = await request.json()

    if (!title || !teamId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const normalizedDeadline =
      deadline === null || deadline === undefined || deadline === ""
        ? null
        : typeof deadline === "string"
          ? new Date(deadline)
          : null

    if (normalizedDeadline && Number.isNaN(normalizedDeadline.getTime())) {
      return NextResponse.json({ error: "Invalid deadline" }, { status: 400 })
    }

    const rawAssigneeId = typeof assigneeId === "string" ? assigneeId.trim() : ""
    let normalizedAssigneeIds: Array<string | null> = [null]

    if (rawAssigneeId) {
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          teamId,
          OR: [{ id: rawAssigneeId }, { userId: rawAssigneeId }],
        },
        select: { id: true, userId: true },
      })

      if (teamMember) {
        normalizedAssigneeIds = Array.from(new Set([teamMember.id, teamMember.userId]))
      } else {
        normalizedAssigneeIds = [rawAssigneeId]
      }
    }

    // Get the highest order number for the status
    const lastTask = await prisma.task.findFirst({
      where: { teamId, status: status || "todo" },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const baseData = {
      title,
      description,
      teamId,
      userId: session.userId,
      priority: priority || "medium",
      status: status || "todo",
      order: lastTask ? lastTask.order + 1 : 0,
      deadline: normalizedDeadline,
    }

    let task
    let lastError: any = null
    for (const candidate of normalizedAssigneeIds) {
      try {
        task = await prisma.task.create({
          data: {
            ...baseData,
            assigneeId: candidate,
          },
          select: taskResponseSelect,
        })
        break
      } catch (error: any) {
        if (isMissingTaskDeadlineColumn(error)) {
          const { deadline: _deadline, ...baseDataWithoutDeadline } = baseData
          task = await prisma.task.create({
            data: {
              ...baseDataWithoutDeadline,
              assigneeId: candidate,
            },
            select: taskResponseSelect,
          })
          break
        }

        if (error?.code !== "P2003") {
          throw error
        }
        lastError = error
      }
    }

    if (!task) {
      if (lastError) {
        throw lastError
      }
      task = await prisma.task.create({
        data: {
          ...baseData,
          assigneeId: null,
        },
        select: taskResponseSelect,
      })
    }

    const [hydratedTask] = await hydrateTaskAssignees([task])

    return NextResponse.json({ task: hydratedTask }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
