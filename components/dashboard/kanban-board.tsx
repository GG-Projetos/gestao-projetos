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

  console.log("🎯 KanbanBoard renderizado:")
  console.log("📊 Grupo atual:", currentGroup?.name)
  console.log(
    "📋 Colunas:",
    columns.length,
    columns.map((c) => ({ id: c.id, title: c.title, group_id: c.group_id })),
  )
  console.log("📝 Tarefas:", tasks.length)

  if (!currentGroup) {
    console.log("❌ Nenhum grupo selecionado no KanbanBoard")
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
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

  console.log("🔍 Filtro aplicado:")
  console.log("🎯 ID do grupo atual:", currentGroup.id)
  console.log("📋 Colunas filtradas:", groupColumns.length)

  const handleCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId)
    setShowCreateTask(true)
  }

  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    console.log("🎯 Iniciando drag da tarefa:", taskId)
    e.dataTransfer.setData("text/plain", taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleTaskDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()

    const taskId = e.dataTransfer.getData("text/plain")
    if (taskId && taskId !== "undefined") {
      console.log("🔄 Movendo tarefa:", taskId, "para coluna:", columnId)
      moveTask(taskId, columnId)
      toast({
        title: "Tarefa movida",
        description: "A tarefa foi movida com sucesso.",
      })
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
            {groupColumns.length > 0 ? (
              groupColumns.map((column) => {
                const columnTasks = tasks.filter((task) => task.column_id === column.id)
                console.log(`📋 Coluna ${column.title}: ${columnTasks.length} tarefas`)

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
              })
            ) : (
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
    </>
  )
}
