import { NextResponse } from "next/server"
import { mkdir, unlink, writeFile } from "fs/promises"
import path from "path"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MAX_BYTES = 2 * 1024 * 1024

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
}

function userSelect() {
  return {
    id: true,
    email: true,
    name: true,
    avatarUrl: true,
    createdAt: true,
    updatedAt: true,
  } as const
}

async function removeAvatarFile(avatarUrl: string | null) {
  if (!avatarUrl || !avatarUrl.startsWith("/uploads/avatars/")) return
  const rel = avatarUrl.replace(/^\//, "")
  const full = path.join(process.cwd(), "public", rel)
  try {
    await unlink(full)
  } catch {
    // file missing or unreadable — ignore
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Нужно выбрать файл изображения" }, { status: 400 })
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Пустой файл" }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Файл слишком большой (максимум 2 МБ)" }, { status: 400 })
    }

    const ext = MIME_TO_EXT[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: "Допустимы только изображения JPEG, PNG, WebP и GIF" },
        { status: 400 },
      )
    }

    const existing = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { avatarUrl: true },
    })
    if (existing?.avatarUrl) {
      await removeAvatarFile(existing.avatarUrl)
    }

    const dir = path.join(process.cwd(), "public", "uploads", "avatars")
    await mkdir(dir, { recursive: true })

    const filename = `${session.userId}${ext}`
    const relativePublic = `/uploads/avatars/${filename}`
    const fullPath = path.join(dir, filename)

    const buf = Buffer.from(await file.arrayBuffer())
    await writeFile(fullPath, buf)

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: relativePublic },
      select: userSelect(),
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[avatar] POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { avatarUrl: true },
    })
    if (existing?.avatarUrl) {
      await removeAvatarFile(existing.avatarUrl)
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: null },
      select: userSelect(),
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[avatar] DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
