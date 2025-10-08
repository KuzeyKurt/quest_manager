import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { subDays, startOfDay, endOfDay } from "date-fns"

export async function GET(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = await params

    // Get all tasks for the team
    const tasks = await prisma.task.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Calculate statistics
    const totalTasks = tasks.length
    const todoTasks = tasks.filter((t) => t.status === "todo").length
    const inProgressTasks = tasks.filter((t) => t.status === "inprogress").length
    const completeTasks = tasks.filter((t) => t.status === "complete").length

    // Priority breakdown
    const highPriority = tasks.filter((t) => t.priority === "high").length
    const mediumPriority = tasks.filter((t) => t.priority === "medium").length
    const lowPriority = tasks.filter((t) => t.priority === "low").length

    // Tasks by user
    const tasksByUser = tasks.reduce(
      (acc, task) => {
        const userName = task.user.name
        if (!acc[userName]) {
          acc[userName] = { total: 0, completed: 0 }
        }
        acc[userName].total++
        if (task.status === "complete") {
          acc[userName].completed++
        }
        return acc
      },
      {} as Record<string, { total: number; completed: number }>,
    )

    // Tasks created over last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      return {
        date: date.toISOString().split("T")[0],
        count: 0,
      }
    })

    tasks.forEach((task) => {
      const taskDate = task.createdAt.toISOString().split("T")[0]
      const dayData = last7Days.find((d) => d.date === taskDate)
      if (dayData) {
        dayData.count++
      }
    })

    // Completion rate over last 7 days
    const completionData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)

      const completedOnDay = tasks.filter(
        (t) => t.status === "complete" && t.updatedAt >= dayStart && t.updatedAt <= dayEnd,
      ).length

      return {
        date: dateStr,
        completed: completedOnDay,
      }
    })

    return NextResponse.json({
      overview: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        complete: completeTasks,
      },
      priority: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
      },
      tasksByUser: Object.entries(tasksByUser).map(([name, data]) => ({
        name,
        total: data.total,
        completed: data.completed,
      })),
      tasksCreated: last7Days,
      tasksCompleted: completionData,
    })
  } catch (error) {
    console.error("[v0] Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
