import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teams = await prisma.team.findMany({
      where: {
        OR: [{ creatorId: session.userId }, { members: { some: { userId: session.userId } } }],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
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
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    })

    return NextResponse.json({ teams })
  } catch (error) {
    console.error("[v0] Get teams error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        creatorId: session.userId,
        members: {
          create: {
            userId: session.userId,
            role: "admin",
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
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

    return NextResponse.json({ team }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create team error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
