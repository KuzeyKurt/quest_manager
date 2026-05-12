import { NextResponse } from "next/server"
import { clearSessionOnResponse } from "@/lib/auth"

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    clearSessionOnResponse(response)
    return response
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
