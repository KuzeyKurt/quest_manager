import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

let ensureTaskDeadlineColumnPromise: Promise<void> | null = null

export async function ensureTaskDeadlineColumn(): Promise<void> {
  if (!ensureTaskDeadlineColumnPromise) {
    ensureTaskDeadlineColumnPromise = prisma
      .$executeRawUnsafe('ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "deadline" TIMESTAMP(3)')
      .then(() => undefined)
      .catch(() => undefined)
  }

  await ensureTaskDeadlineColumnPromise
}

export function isTransientPrismaConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false
  }

  const candidate = error as { code?: string; message?: string }
  const code = candidate.code ?? ""
  const message = (candidate.message ?? "").toLowerCase()

  if (code === "P1001" || code === "P1017") {
    return true
  }

  return (
    message.includes("server has closed the connection") ||
    message.includes("connection terminated unexpectedly") ||
    message.includes("can't reach database server") ||
    message.includes("econnreset")
  )
}

export async function withPrismaRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isTransientPrismaConnectionError(error) || attempt === retries) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)))
      await prisma.$disconnect().catch(() => undefined)
    }
  }

  throw lastError
}
