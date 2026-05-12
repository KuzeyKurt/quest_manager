"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { TaskColumn } from "./task-column"
import { TaskCard } from "./task-card"
import { TaskDialog } from "./task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"
import { redirectToLoginPreservingReturn } from "@/lib/redirect-login"

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  order: number
  deadline?: string | null
  assigneeId?: string | null
  assignee?: {
    id: string
    user: {
      id: string
      name: string
      email: string
    }
  } | null
  user: {
    id: string
    name: string
    email: string
  }
}

interface TaskBoardProps {
  teamId: string
  teamMembers: Array<{
    id: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
}

export function TaskBoard({ teamId, teamMembers }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setFetchError(null)
      try {
        const res = await fetchWithTimeout(`/api/tasks?teamId=${teamId}`, { method: "GET" })
        const data = await res.json().catch(() => null)
        if (cancelled) return
        if (!res.ok) {
          if (res.status === 401) {
            redirectToLoginPreservingReturn()
            return
          }
          const msg =
            data && typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : "Не удалось загрузить задачи"
          setFetchError(msg)
          setTasks([])
          return
        }
        setTasks(Array.isArray((data as { tasks?: unknown })?.tasks) ? (data as { tasks: Task[] }).tasks : [])
      } catch (error: unknown) {
        const name = typeof error === "object" && error && "name" in error ? (error as Error).name : ""
        const message =
          name === "AbortError"
            ? "Сервер не ответил за отведённое время. Проверьте БД или перезапустите dev-сервер."
            : error instanceof Error
              ? error.message
              : "Не удалось загрузить задачи"
        if (!cancelled) {
          setFetchError(message)
          setTasks([])
          console.error("[v0] Fetch tasks error:", error)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [teamId])

  const fetchTasks = async () => {
    setFetchError(null)
    try {
      const res = await fetchWithTimeout(`/api/tasks?teamId=${teamId}`, { method: "GET" })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        if (res.status === 401) {
          redirectToLoginPreservingReturn()
          return
        }
        const msg =
          data && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Не удалось обновить задачи"
        setFetchError(msg)
        return
      }
      setTasks(Array.isArray((data as { tasks?: unknown })?.tasks) ? (data as { tasks: Task[] }).tasks : [])
    } catch (error: unknown) {
      const name = typeof error === "object" && error && "name" in error ? (error as Error).name : ""
      setFetchError(
        name === "AbortError"
          ? "Таймаут при обновлении списка задач."
          : error instanceof Error
            ? error.message
            : "Не удалось обновить задачи",
      )
      console.error("[v0] Fetch tasks refresh error:", error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    const overId = over.id as string
    const isOverColumn = ["todo", "inprogress", "complete"].includes(overId)

    if (isOverColumn) {
      const newStatus = overId
      if (activeTask.status !== newStatus) {
        const tasksInNewStatus = tasks.filter((t) => t.status === newStatus)
        const newOrder = tasksInNewStatus.length

        setTasks((prev) => prev.map((t) => (t.id === activeTask.id ? { ...t, status: newStatus, order: newOrder } : t)))

        await fetchWithTimeout("/api/tasks/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: activeTask.id,
            newStatus,
            newOrder,
          }),
        })
      }
    } else {
      const overTask = tasks.find((t) => t.id === overId)
      if (!overTask || activeTask.status !== overTask.status) return

      const oldIndex = tasks.findIndex((t) => t.id === active.id)
      const newIndex = tasks.findIndex((t) => t.id === overId)

      const newTasks = arrayMove(tasks, oldIndex, newIndex)
      setTasks(newTasks)

      await fetchWithTimeout("/api/tasks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: activeTask.id,
          newStatus: activeTask.status,
          newOrder: newIndex,
        }),
      })
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Вы действительно хотите удалить эту задачу?")) return

    try {
      await fetchWithTimeout(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error("[v0] Delete task error:", error)
    }
  }

  const handleSaveTask = async (data: Partial<Task>) => {
    if (editingTask) {
      const res = await fetchWithTimeout(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || "Не удалось обновить задачу")
      }
      const task = payload?.task
      if (!task) {
        throw new Error("Сервер вернул некорректный ответ при обновлении задачи")
      }
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
      await fetchTasks()
    } else {
      const res = await fetchWithTimeout("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, teamId }),
      })
      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || "Не удалось создать задачу")
      }
      const task = payload?.task
      if (!task) {
        throw new Error("Сервер вернул некорректный ответ при создании задачи")
      }
      setTasks((prev) => [...prev, task])
      await fetchTasks()
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Загрузка задач...</div>
  }

  const todoTasks = tasks.filter((t) => t.status === "todo")
  const inProgressTasks = tasks.filter((t) => t.status === "inprogress")
  const completeTasks = tasks.filter((t) => t.status === "complete")

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Доска задач</h1>
        <Button onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          Новая задача
        </Button>
      </div>

      {fetchError ? (
        <div className="mb-4 rounded-md border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive flex flex-wrap items-center justify-between gap-2">
          <span>{fetchError}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void fetchTasks()}>
            Повторить
          </Button>
        </div>
      ) : null}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn
            status="todo"
            title="To Do"
            tasks={todoTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
          <TaskColumn
            status="inprogress"
            title="In Progress"
            tasks={inProgressTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
          <TaskColumn
            status="complete"
            title="Complete"
            tasks={completeTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
        teamMembers={teamMembers.map((m) => ({
          userId: m.user.id,
          name: m.user.name,
          email: m.user.email,
        }))}
      />
    </>
  )
}
