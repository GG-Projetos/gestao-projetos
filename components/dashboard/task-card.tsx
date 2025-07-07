"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Task } from "@/contexts/task-context"
import { EditTaskModal } from "@/components/modals/edit-task-modal"
import { Calendar, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTask } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const [showEditTask, setShowEditTask] = useState(false)
  const { deleteTask } = useTask()
  const { toast } = useToast()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      case "baixa":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowEditTask(true)}
                title="Editar tarefa"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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

          {task.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>}

          {task.meta && (
            <div className="mb-3">
              <Badge variant="outline" className="text-xs">
                Meta: {task.meta}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)} {task.priority}
              </Badge>
            </div>

            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span className={isOverdue(task.deadline) ? "text-red-600 font-medium" : ""}>
                {formatDate(task.deadline)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTaskModal open={showEditTask} onOpenChange={setShowEditTask} task={task} />
    </>
  )
}
