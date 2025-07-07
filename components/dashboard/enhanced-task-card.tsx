"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Task } from "@/contexts/task-context"
import { EditTaskModal } from "@/components/modals/edit-task-modal"
import { Calendar, MoreHorizontal, Trash2, Edit, GripVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTask } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"

interface TaskCardProps {
  task: Task
}

export function EnhancedTaskCard({ task }: TaskCardProps) {
  const [showEditTask, setShowEditTask] = useState(false)
  const { deleteTask } = useTask()
  const { toast } = useToast()

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
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const handleDeleteTask = () => {
    if (confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
      deleteTask(task.id)
      toast({
        title: "Tarefa excluída",
        description: `A tarefa "${task.title}" foi excluída com sucesso.`,
      })
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border-l-4 border-l-blue-400">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <GripVertical className="h-4 w-4 text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">{task.title}</h4>
                {task.description && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{task.description}</p>}
              </div>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEditTask(true)
                }}
                title="Editar tarefa"
              >
                <Edit className="h-3 w-3" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditTask(true)}>
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
          </div>

          {task.meta && (
            <div className="mb-3">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                🎯 {task.meta}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Badge className={`text-xs border ${getPriorityColor(task.priority)}`}>
              {getPriorityIcon(task.priority)} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>

            <div className="flex items-center text-xs">
              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
              <span
                className={`${isOverdue(task.deadline) ? "text-red-600 font-medium bg-red-50 px-2 py-1 rounded" : "text-gray-500"}`}
              >
                {formatDate(task.deadline)}
                {isOverdue(task.deadline) && " ⚠️"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTaskModal open={showEditTask} onOpenChange={setShowEditTask} task={task} />
    </>
  )
}
