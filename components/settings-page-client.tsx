"use client"

import { useMemo, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SettingsUser = {
  id: string
  email: string
  name: string
}

export function SettingsPageClient({ user }: { user: SettingsUser }) {
  const [email, setEmail] = useState(user.email)
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [info, setInfo] = useState<string>("")
  const [error, setError] = useState<string>("")

  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)

  const hint = useMemo(() => {
    if (!requested) return ""
    return "Мок-режим: код для смены пароля — 55555."
  }, [requested])

  const requestReset = async () => {
    setError("")
    setInfo("")
    setRequesting(true)
    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Не удалось отправить код")
      }
      setRequested(true)
      setInfo(payload?.message || "Код отправлен (мок).")
    } catch (e: any) {
      setError(e?.message || "Не удалось отправить код")
    } finally {
      setRequesting(false)
    }
  }

  const confirmReset = async () => {
    setError("")
    setInfo("")
    setSaving(true)
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, newPassword }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || "Не удалось сменить пароль")
      }
      setInfo("Пароль изменён.")
      setCode("")
      setNewPassword("")
      setRequested(false)
    } catch (e: any) {
      setError(e?.message || "Не удалось сменить пароль")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Настройки</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Смена пароля</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Почта аккаунта</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <p className="text-sm text-muted-foreground">
                Сейчас “отправка письма” мокнута: мы просто имитируем отправку, а код всегда один.
              </p>
            </div>

            <Button onClick={requestReset} disabled={requesting || !email}>
              {requesting ? "Отправляем..." : "Отправить код на почту"}
            </Button>

            {requested ? (
              <div className="rounded-md border p-4 space-y-3">
                {hint ? <p className="text-sm font-medium">{hint}</p> : null}

                <div className="grid gap-2">
                  <Label htmlFor="code">Код</Label>
                  <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="55555" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={confirmReset} disabled={saving || !code || !newPassword}>
                    {saving ? "Сохраняем..." : "Сменить пароль"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRequested(false)
                      setCode("")
                      setNewPassword("")
                      setInfo("")
                      setError("")
                    }}
                    disabled={saving}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {info ? <p className="text-sm text-foreground">{info}</p> : null}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

