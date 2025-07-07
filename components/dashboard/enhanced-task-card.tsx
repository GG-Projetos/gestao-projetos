"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Calendar, User, Edit, Trash2 } from "lucide-react"
import { useTask } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"
import { EditTaskModal } from "@/components/modals/edit-task-modal"
import type { Task } from "@/lib/supabase"

interface EnhancedTaskCardProps {
  task: Task
  onDragStart?: (e: React.DragEvent) => void
}

export function EnhancedTaskCard({ task, onDragStart }: EnhancedTaskCardProps) {
  const [showEditTask, setShowEditTask] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { deleteTask } = useTask()
  const { toast } = useToast()

  const handleDeleteTask = () => {
    if (confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
      deleteTask(task.id)
      toast({
        title: "Tarefa excluída",
        description: `A tarefa "${task.title}" foi excluída com sucesso.`,
      })
    }
  }

  const handleEditTask = () => {
    setShowEditTask(true)
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    if (onDragStart) {
      onDragStart(e)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200"
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "baixa":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "alta":
        return "🔴"
      case "media":
        return "🟡"
      case "baixa":
        return "🟢"
      default:
        return "⚪"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const isOverdue = (deadline: string) => {
    const today = new Date()
    const taskDeadline = new Date(deadline)
    return taskDeadline < today
  }

  return (
    <>
      <Card
        className={`cursor-move hover:shadow-md transition-all bg-white border border-gray-200 group touch-manipulation ${
          isDragging ? "opacity-50 rotate-2 scale-105" : ""
        }`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0">{task.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0 sm:opacity-100"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditTask}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteTask} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {task.description && <p className="text-xs text-gray-600 line-clamp-2 break-words">{task.description}</p>}

          {task.meta && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
              <p className="text-xs text-blue-800 font-medium break-words">Meta: {task.meta}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Badge className={`text-xs px-2 py-1 w-fit ${getPriorityColor(task.priority)}`}>
              {getPriorityIcon(task.priority)} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>

            <div
              className={`flex items-center gap-1 text-xs ${isOverdue(task.deadline) ? "text-red-600" : "text-gray-500"}`}
            >
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{formatDate(task.deadline)}</span>
            </div>
          </div>

          {task.assigned_to && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User className="h-3 w-3 flex-shrink-0" />
              <span>Atribuído</span>
            </div>
          )}
        </CardContent>
      </Card>

      <EditTaskModal open={showEditTask} onOpenChange={setShowEditTask} taskId={task.id} />
    </>
  )
}
