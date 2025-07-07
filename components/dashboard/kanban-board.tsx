"use client"

import { useState } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useTask } from "@/contexts/task-context"
import { DraggableColumn } from "./draggable-column"
import { CreateColumnModal } from "@/components/modals/create-column-modal"
import { CreateTaskModal } from "@/components/modals/create-task-modal"

export function KanbanBoard() {
  const { columns, tasks, currentGroup, moveTask } = useTask()
  const [showCreateColumn, setShowCreateColumn] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string>("")

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    // Se não houve mudança de posição
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // Mover tarefa entre colunas
    if (destination.droppableId !== source.droppableId) {
      try {
        await moveTask(draggableId, destination.droppableId)
      } catch (error) {
        console.error("Erro ao mover tarefa:", error)
      }
    }
  }

  const handleCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId)
    setShowCreateTask(true)
  }

  if (!currentGroup) {
    return null
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold truncate">{currentGroup.name}</h1>
          {currentGroup.description && (
            <p className="text-sm text-muted-foreground truncate mt-1">{currentGroup.description}</p>
          )}
        </div>
        <Button onClick={() => setShowCreateColumn(true)} className="flex-shrink-0 ml-4">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nova Coluna</span>
          <span className="sm:hidden">Coluna</span>
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 p-4 h-full min-w-max">
            {columns.map((column) => (
              <DraggableColumn
                key={column.id}
                column={column}
                tasks={tasks.filter((task) => task.column_id === column.id)}
                onCreateTask={() => handleCreateTask(column.id)}
              />
            ))}

            {/* Empty state quando não há colunas */}
            {columns.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhuma coluna criada</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie sua primeira coluna para começar a organizar as tarefas
                  </p>
                  <Button onClick={() => setShowCreateColumn(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Coluna
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DragDropContext>
      </div>

      {/* Modais */}
      <CreateColumnModal open={showCreateColumn} onOpenChange={setShowCreateColumn} />
      <CreateTaskModal
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        columnId={selectedColumnId}
        groupId={currentGroup.id}
      />
    </div>
  )
}
