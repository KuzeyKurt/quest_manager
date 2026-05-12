/**
 * Обёртка над fetch с таймаутом и cookies (для авторизованных API).
 * Без этого при «висящем» сервере/БД интерфейс может бесконечно показывать загрузку.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs = 35_000,
): Promise<Response> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
      credentials: "include",
    })
  } finally {
    clearTimeout(t)
  }
}
