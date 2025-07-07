"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react"
import { useTask } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"
import { EnhancedTaskCard } from "./enhanced-task-card"
import type { Column, Task } from "@/lib/supabase"
import { CreateTaskModal } from "@/components/modals/create-task-modal"
import { EditColumnModal } from "@/components/modals/edit-column-modal"

interface DraggableColumnProps {
  column: Column
  tasks: Task[]
  onTaskDragStart: (e: React.DragEvent, taskId: string) => void
  onTaskDragOver: (e: React.DragEvent) => void
  onTaskDrop: (e: React.DragEvent, columnId: string) => void
  onCreateTask: (columnId: string) => void
}

export function DraggableColumn({
  column,
  tasks,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDrop,
  onCreateTask,
}: DraggableColumnProps) {
  const { deleteColumn } = useTask()
  const { toast } = useToast()
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showEditColumn, setShowEditColumn] = useState(false)

  const handleDeleteColumn = () => {
    if (confirm(`Tem certeza que deseja excluir a coluna "${column.title}"?`)) {
      deleteColumn(column.id)
      toast({
        title: "Coluna excluída",
        description: `A coluna "${column.title}" foi excluída com sucesso.`,
      })
    }
  }

  const handleCreateTask = () => {
    onCreateTask(column.id)
  }

  const handleEditColumn = () => {
    setShowEditColumn(true)
  }

  return (
    <>
      <Card className="w-80 flex-shrink-0 bg-gray-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{tasks.length}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCreateTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar tarefa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditColumn}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar coluna
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteColumn} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir coluna
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent
          className="space-y-3 min-h-[200px]"
          onDragOver={onTaskDragOver}
          onDrop={(e) => onTaskDrop(e, column.id)}
        >
          {tasks.map((task) => (
            <EnhancedTaskCard key={task.id} task={task} onDragStart={(e) => onTaskDragStart(e, task.id)} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Nenhuma tarefa ainda</p>
              <Button variant="ghost" size="sm" onClick={handleCreateTask} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeira tarefa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTaskModal open={showCreateTask} onOpenChange={setShowCreateTask} columnId={column.id} />

      <EditColumnModal open={showEditColumn} onOpenChange={setShowEditColumn} columnId={column.id} />
    </>
  )
}
