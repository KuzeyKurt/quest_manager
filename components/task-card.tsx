"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  user: {
    name: string
  }
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    high: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-shadow",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{task.title}</h3>
          {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn("text-xs", priorityColors[task.priority as keyof typeof priorityColors])}
            >
              {task.priority}
            </Badge>
            <span className="text-xs text-muted-foreground">{task.user.name}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(task)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
