"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EnhancedTaskCard } from "@/components/dashboard/enhanced-task-card"
import { CreateTaskModal } from "@/components/modals/create-task-modal"
import { EditColumnModal } from "@/components/modals/edit-column-modal"
import { Plus, MoreHorizontal, Trash2, Edit, GripVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTask, type Column, type Task } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"

interface DraggableColumnProps {
  column: Column
  tasks: Task[]
  onDragStart: (e: React.DragEvent, columnId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, columnId: string) => void
  onTaskDragStart: (e: React.DragEvent, taskId: string) => void
  onTaskDrop: (e: React.DragEvent, columnId: string) => void
}

export function DraggableColumn({
  column,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  onTaskDragStart,
  onTaskDrop,
}: DraggableColumnProps) {
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [editingColumn, setEditingColumn] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { deleteColumn } = useTask()
  const { toast } = useToast()

  const handleDeleteColumn = () => {
    if (confirm(`Tem certeza que deseja excluir a coluna "${column.title}"?`)) {
      deleteColumn(column.id)
      toast({
        title: "Coluna excluída",
        description: `A coluna "${column.title}" foi excluída com sucesso.`,
      })
    }
  }

  const handleColumnDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData("application/x-column", column.id) // Mudança aqui
    e.dataTransfer.effectAllowed = "move"
  }

  const handleColumnDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <>
      <div
        className={`w-80 bg-white rounded-lg shadow-sm border flex flex-col transition-all duration-200 ${
          isDragging ? "opacity-50 rotate-2 scale-105" : "hover:shadow-md"
        }`}
        draggable
        onDragStart={handleColumnDragStart}
        onDragEnd={handleColumnDragEnd}
        onDragOver={onDragOver}
      >
        {/* Column Header */}
        <div
          className="p-4 border-b border-gray-100 cursor-move hover:bg-gray-50 transition-colors group"
          onDragStart={handleColumnDragStart}
          onDragEnd={handleColumnDragEnd}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{tasks.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowCreateTask(true)
                }}
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Adicionar tarefa"
              >
                <Plus className="h-3 w-3" />
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
                  <DropdownMenuItem onClick={() => setEditingColumn(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteColumn} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Tasks Area */}
        <div
          className="flex-1 min-h-[200px] p-4"
          onDragOver={onDragOver}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()

            // Verificar se é uma tarefa sendo arrastada
            const taskId = e.dataTransfer.getData("text/plain")
            if (taskId) {
              onTaskDrop(e, column.id)
              return
            }

            // Se não for tarefa, pode ser coluna
            onDrop(e, column.id)
          }}
        >
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} draggable onDragStart={(e) => onTaskDragStart(e, task.id)} className="cursor-move">
                  <EnhancedTaskCard task={task} />
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm mb-2">Nenhuma tarefa</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateTask(true)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar tarefa
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <CreateTaskModal open={showCreateTask} onOpenChange={setShowCreateTask} columnId={column.id} />

      {editingColumn && <EditColumnModal open={editingColumn} onOpenChange={setEditingColumn} columnId={column.id} />}
    </>
  )
}
