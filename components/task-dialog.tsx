"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TeamMember {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  assigneeId: string | null
  assignee?: {
    id: string
    user: {
      id: string
      name: string
      email: string
    }
  } | null
}

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onSave: (data: Partial<Task>) => Promise<void>
  teamId: string
}

export function TaskDialog({ open, onOpenChange, task, onSave, teamId }: TaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [status, setStatus] = useState("todo")
  const [assigneeId, setAssigneeId] = useState("")
  const [loading, setLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  useEffect(() => {
    if (open && teamId) {
      fetchTeamMembers()
    }
  }, [open, teamId])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setPriority(task.priority)
      setStatus(task.status)
      setAssigneeId(task.assigneeId || "none")
    } else {
      setTitle("")
      setDescription("")
      setPriority("medium")
      setStatus("todo")
      setAssigneeId("none")
    }
  }, [task])

  const fetchTeamMembers = async () => {
    setLoadingMembers(true)
    try {
      const res = await fetch(`/api/teams/${teamId}/members`)
      const data = await res.json()
      if (res.ok) {
        setTeamMembers(data.members || [])
      }
    } catch (error) {
      console.error("[v0] Fetch team members error:", error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave({
        title,
        description: description || null,
        priority,
        status,
        assigneeId: assigneeId === "none" ? null : assigneeId,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Save task error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Редактировать задачу" : "Добавить задачу"}</DialogTitle>
          <DialogDescription>
            {task ? "Внесите изменения в свою задачу" : "Добавьте новую задачу в проект"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                placeholder="Название задачи"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Описание задачи (опционально)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Назначен</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId} disabled={loadingMembers}>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder={loadingMembers ? "Загрузка..." : "Выберите участника"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не назначен</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : task ? "Сохранить изменения" : "Добавить задачу"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
