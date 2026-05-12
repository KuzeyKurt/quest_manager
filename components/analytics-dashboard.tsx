"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"
import { redirectToLoginPreservingReturn } from "@/lib/redirect-login"

interface AnalyticsData {
  overview: {
    total: number
    todo: number
    inProgress: number
    complete: number
  }
  priority: {
    high: number
    medium: number
    low: number
  }
  tasksByUser: Array<{
    name: string
    total: number
    completed: number
  }>
  tasksCreated: Array<{
    date: string
    count: number
  }>
  tasksCompleted: Array<{
    date: string
    completed: number
  }>
}

interface AnalyticsDashboardProps {
  teamId: string
}

export function AnalyticsDashboard({ teamId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setFetchError(null)
      try {
        const res = await fetchWithTimeout(`/api/analytics/${teamId}`, { method: "GET" })
        const payload = await res.json().catch(() => null)
        if (cancelled) return
        if (!res.ok) {
          if (res.status === 401) {
            redirectToLoginPreservingReturn()
            return
          }
          const apiMsg =
            payload && typeof (payload as { error?: unknown }).error === "string"
              ? (payload as { error: string }).error
              : "Не удалось загрузить аналитику"
          setData(null)
          setFetchError(apiMsg)
          return
        }
        setData(payload as AnalyticsData)
      } catch (error: unknown) {
        const name = typeof error === "object" && error && "name" in error ? (error as Error).name : ""
        if (!cancelled) {
          setData(null)
          setFetchError(
            name === "AbortError"
              ? "Таймаут загрузки аналитики. Проверьте доступность базы данных."
              : error instanceof Error
                ? error.message
                : "Не удалось загрузить аналитику",
          )
          console.error("[v0] Fetch analytics error:", error)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [teamId, reloadTick])

  if (loading) {
    return <div className="flex items-center justify-center h-96">Загрузка аналитики...</div>
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[16rem] text-center px-4">
        <p className="text-sm text-muted-foreground">{fetchError ?? "Данные недоступны"}</p>
        <button
          type="button"
          className="text-sm underline underline-offset-4 text-primary"
          onClick={() => setReloadTick((k) => k + 1)}
        >
          Повторить
        </button>
      </div>
    )
  }

  const completionRate = data.overview.total > 0 ? Math.round((data.overview.complete / data.overview.total) * 100) : 0

  const statusData = [
    { name: "To Do", value: data.overview.todo, color: "oklch(0.627 0.265 303.9)" },
    { name: "In Progress", value: data.overview.inProgress, color: "oklch(0.398 0.07 227.392)" },
    { name: "Complete", value: data.overview.complete, color: "oklch(0.696 0.17 162.48)" },
  ]

  const priorityData = [
    { name: "High", value: data.priority.high, fill: "oklch(0.637 0.237 25.331)" },
    { name: "Medium", value: data.priority.medium, fill: "oklch(0.769 0.188 70.08)" },
    { name: "Low", value: data.priority.low, fill: "oklch(0.488 0.243 264.376)" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего задач</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.total}</div>
            <p className="text-xs text-muted-foreground">По всем статусам</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В процессе</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.inProgress}</div>
            <p className="text-xs text-muted-foreground">Задач сейчас в работе</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выполнено</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.complete}</div>
            <p className="text-xs text-muted-foreground">Успешно завершено</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Статус завершения</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Всех задач</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Статистика по задачам</CardTitle>
            <CardDescription>Статистика задач по текущему статусуs</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                todo: { label: "To Do", color: "oklch(0.627 0.265 303.9)" },
                inprogress: { label: "In Progress", color: "oklch(0.398 0.07 227.392)" },
                complete: { label: "Complete", color: "oklch(0.696 0.17 162.48)" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Стаистика приоритета</CardTitle>
            <CardDescription>Группировка задач по приоритету</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                high: { label: "High", color: "hsl(var(--chart-1))" },
                medium: { label: "Medium", color: "hsl(var(--chart-4))" },
                low: { label: "Low", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Добавлено задач за последние 7 дней</CardTitle>
            <CardDescription>Тенденция создания задач по дням</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Добавлено задач: ", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.tasksCreated}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--chart-2))" }}
                    activeDot={{ r: 6, fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Выполнено задач за последние 7 дней</CardTitle>
            <CardDescription>Тенденция создания задач по дням</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completed: { label: "Выполнено задач: ", color: "hsl(var(--chart-3))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.tasksCompleted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--chart-3))" }}
                    activeDot={{ r: 6, fill: "hsl(var(--chart-3))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Эффективность работы членов команды</CardTitle>
          <CardDescription>Выполнение задачи членом команды</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              total: { label: "Всего задач", color: "oklch(0.627 0.265 303.9)" },
              completed: { label: "Completed", color: "oklch(0.696 0.17 162.48)" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.tasksByUser}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="total" fill="oklch(0.627 0.265 303.9)" name="Total Tasks" />
                <Bar dataKey="completed" fill="oklch(0.696 0.17 162.48)" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
