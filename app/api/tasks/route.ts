import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
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
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("[v0] Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, teamId, priority, status } = await request.json()

    if (!title || !teamId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the highest order number for the status
    const lastTask = await prisma.task.findFirst({
      where: { teamId, status: status || "todo" },
      orderBy: { order: "desc" },
    })

    const task = await prisma.task.create({
      data: {
        title,
        description,
        teamId,
        userId: session.userId,
        priority: priority || "medium",
        status: status || "todo",
        order: lastTask ? lastTask.order + 1 : 0,
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

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
