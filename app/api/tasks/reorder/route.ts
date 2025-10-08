import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId, newStatus, newOrder } = await request.json()

    if (!taskId || !newStatus || newOrder === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update the task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        order: newOrder,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Reorder task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
