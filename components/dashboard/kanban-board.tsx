"use client"

import type React from "react"

import { useState } from "react"
import { useTask } from "@/contexts/task-context"
import { Button } from "@/components/ui/button"
import { CreateTaskModal } from "@/components/modals/create-task-modal"
import { CreateColumnModal } from "@/components/modals/create-column-modal"
import { EditColumnModal } from "@/components/modals/edit-column-modal"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DraggableColumn } from "@/components/dashboard/draggable-column"

export function KanbanBoard() {
  const { currentGroup, columns, tasks, deleteColumn, moveTask, updateColumn } = useTask()
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showCreateColumn, setShowCreateColumn] = useState(false)
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [selectedColumnId, setSelectedColumnId] = useState<string>("")
  const { toast } = useToast()

  if (!currentGroup) return null

  const groupColumns = columns.filter((col) => col.groupId === currentGroup.id).sort((a, b) => a.order - b.order)

  const handleCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId)
    setShowCreateTask(true)
  }

  const handleDeleteColumn = (columnId: string, columnTitle: string) => {
    if (confirm(`Tem certeza que deseja excluir a coluna "${columnTitle}"?`)) {
      deleteColumn(columnId)
      toast({
        title: "Coluna excluída",
        description: `A coluna "${columnTitle}" foi excluída com sucesso.`,
      })
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()

    // Verificar se é uma tarefa
    const taskId = e.dataTransfer.getData("text/plain")
    if (taskId) {
      moveTask(taskId, columnId)
    }
  }

  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    e.dataTransfer.setData("application/x-column", columnId) // Mudança aqui
    e.dataTransfer.effectAllowed = "move"
  }

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleColumnDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    e.stopPropagation()

    const draggedColumnId = e.dataTransfer.getData("application/x-column") // Mudança aqui

    if (draggedColumnId && draggedColumnId !== targetColumnId) {
      const draggedColumn = groupColumns.find((col) => col.id === draggedColumnId)
      const targetColumn = groupColumns.find((col) => col.id === targetColumnId)

      if (draggedColumn && targetColumn) {
        const newColumns = [...groupColumns]
        const draggedIndex = newColumns.findIndex((col) => col.id === draggedColumnId)
        const targetIndex = newColumns.findIndex((col) => col.id === targetColumnId)

        const [removed] = newColumns.splice(draggedIndex, 1)
        newColumns.splice(targetIndex, 0, removed)

        // Atualizar apenas as ordens das colunas afetadas
        newColumns.forEach((col, index) => {
          if (col.order !== index + 1) {
            updateColumn(col.id, col.title, index + 1)
          }
        })

        toast({
          title: "Coluna reordenada",
          description: "A ordem das colunas foi atualizada.",
        })
      }
    }
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentGroup.name}</h1>
              <p className="text-gray-600">{currentGroup.description}</p>
            </div>
            <Button onClick={() => setShowCreateColumn(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Coluna
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 p-6 overflow-x-auto">
          <div className="flex gap-6 h-full min-w-max">
            {groupColumns.map((column) => {
              const columnTasks = tasks.filter((task) => task.columnId === column.id)

              return (
                <DraggableColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onDragStart={handleColumnDragStart}
                  onDragOver={handleColumnDragOver}
                  onDrop={handleColumnDrop}
                  onTaskDragStart={handleDragStart}
                  onTaskDrop={handleDrop}
                />
              )
            })}

            {groupColumns.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma coluna ainda</h3>
                  <p className="text-gray-500 mb-4">Crie sua primeira coluna para começar a organizar as tarefas</p>
                  <Button onClick={() => setShowCreateColumn(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira coluna
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateTaskModal open={showCreateTask} onOpenChange={setShowCreateTask} columnId={selectedColumnId} />

      <CreateColumnModal open={showCreateColumn} onOpenChange={setShowCreateColumn} />

      {editingColumn && (
        <EditColumnModal open={!!editingColumn} onOpenChange={() => setEditingColumn(null)} columnId={editingColumn} />
      )}
    </>
  )
}
