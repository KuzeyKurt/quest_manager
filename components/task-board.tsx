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

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  order: number
  user: {
    id: string
    name: string
    email: string
  }
}

interface TaskBoardProps {
  teamId: string
}

export function TaskBoard({ teamId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  useEffect(() => {
    fetchTasks()
  }, [teamId])

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?teamId=${teamId}`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error("[v0] Fetch tasks error:", error)
    } finally {
      setLoading(false)
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

        await fetch("/api/tasks/reorder", {
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

      await fetch("/api/tasks/reorder", {
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
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error("[v0] Delete task error:", error)
    }
  }

  const handleSaveTask = async (data: Partial<Task>) => {
    if (editingTask) {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const { task } = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
    } else {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, teamId }),
      })
      const { task } = await res.json()
      setTasks((prev) => [...prev, task])
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

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editingTask} onSave={handleSaveTask} />
    </>
  )
}
