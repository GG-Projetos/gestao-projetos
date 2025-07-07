"use client"

import { Button } from "@/components/ui/button"
import { useTask } from "@/contexts/task-context"
import { Users, Plus } from "lucide-react"
import { useState } from "react"
import { CreateGroupModal } from "@/components/modals/create-group-modal"

export function EmptyState() {
  const { groups } = useTask()
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  return (
    <>
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Users className="h-12 w-12 text-gray-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {groups.length === 0 ? "Bem-vindo!" : "Selecione um grupo"}
          </h2>

          <p className="text-gray-600 mb-6">
            {groups.length === 0
              ? "Crie seu primeiro grupo para começar a organizar suas tarefas de forma colaborativa."
              : "Escolha um grupo na barra lateral para visualizar e gerenciar as tarefas."}
          </p>

          {groups.length === 0 && (
            <Button onClick={() => setShowCreateGroup(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Criar primeiro grupo
            </Button>
          )}
        </div>
      </div>

      <CreateGroupModal open={showCreateGroup} onOpenChange={setShowCreateGroup} />
    </>
  )
}
