"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskCard } from "./task-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  user: {
    name: string
  }
}

interface TaskColumnProps {
  status: string
  title: string
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskColumn({ status, title, tasks, onEdit, onDelete }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const statusColors = {
    todo: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    inprogress: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    complete: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <Badge variant="outline" className={cn("text-xs", statusColors[status as keyof typeof statusColors])}>
          {tasks.length}
        </Badge>
      </div>
      <Card
        ref={setNodeRef}
        className={cn(
          "flex-1 p-4 bg-muted/30 border-dashed min-h-[500px]",
          isOver && "ring-2 ring-primary bg-primary/5",
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </SortableContext>
      </Card>
    </div>
  )
}
