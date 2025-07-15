"use client"

import type React from "react"

import { useState } from "react"
import { useTask } from "@/contexts/task-context"
import { Button } from "@/components/ui/button"
import { CreateTaskModal } from "@/components/modals/create-task-modal"
import { CreateColumnModal } from "@/components/modals/create-column-modal"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DraggableColumn } from "@/components/dashboard/draggable-column"

export function KanbanBoard() {
  const { currentGroup, columns, tasks, moveTask } = useTask()
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showCreateColumn, setShowCreateColumn] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string>("")
  const { toast } = useToast()


  if (!currentGroup) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum grupo selecionado</h2>
          <p className="text-gray-600">Selecione um grupo na barra lateral para começar</p>
        </div>
      </div>
    )
  }

  // Filtrar colunas usando group_id (campo do banco)
  const groupColumns = columns
    .filter((col) => col.group_id === currentGroup.id)
    .sort((a, b) => a.order_index - b.order_index)


  const handleCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId)
    setShowCreateTask(true)
  }

  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleTaskDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()

    const taskId = e.dataTransfer.getData("text/plain")
    if (taskId && taskId !== "undefined") {

      try {
        await moveTask(taskId, columnId)
        toast({
          title: "Tarefa movida",
          description: "A tarefa foi movida com sucesso.",
        })
      } catch (error) {
        console.error("❌ Erro ao mover tarefa:", error)
        toast({
          title: "Erro",
          description: "Não foi possível mover a tarefa.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{currentGroup.name}</h1>
              {currentGroup.description && (
                <p className="text-gray-600 text-sm sm:text-base mt-1">{currentGroup.description}</p>
              )}
            </div>
            <Button onClick={() => setShowCreateColumn(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nova Coluna
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 h-full">
            {groupColumns.length > 0 ? (
              <div className="flex gap-4 sm:gap-6 h-full min-w-max pb-4">
                {groupColumns.map((column) => {
                  const columnTasks = tasks.filter((task) => task.column_id === column.id)

                  return (
                    <DraggableColumn
                      key={column.id}
                      column={column}
                      tasks={columnTasks}
                      onTaskDragStart={handleTaskDragStart}
                      onTaskDragOver={handleTaskDragOver}
                      onTaskDrop={handleTaskDrop}
                      onCreateTask={handleCreateTask}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                  <div className="bg-gray-100 rounded-full p-6 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 flex items-center justify-center">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma coluna ainda</h3>
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">
                    Crie sua primeira coluna para começar a organizar as tarefas
                  </p>
                  <Button onClick={() => setShowCreateColumn(true)} className="w-full sm:w-auto">
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
    </>
  )
}
