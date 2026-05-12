/** Только на клиенте: редирект на /login и возврат на текущий URL после входа. */
export function redirectToLoginPreservingReturn() {
  if (typeof window === "undefined") return
  const returnTo = `${window.location.pathname}${window.location.search}`
  window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`)
}

function safeInternalPath(raw: string | null): string {
  if (!raw?.startsWith("/") || raw.startsWith("//")) return "/dashboard"
  return raw
}

/** Из query текущего URL (?returnTo=...) — только внутренние пути. */
export function getSafeReturnToFromCurrentUrl(): string {
  if (typeof window === "undefined") return "/dashboard"
  return safeInternalPath(new URLSearchParams(window.location.search).get("returnTo"))
}
