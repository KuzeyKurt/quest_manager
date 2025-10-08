import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const session = await getSession()
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")

  if (!session && !isAuthPage && request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
