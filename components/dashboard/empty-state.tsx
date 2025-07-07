"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FolderPlus, Plus } from "lucide-react"
import { CreateGroupModal } from "@/components/modals/create-group-modal"

export function EmptyState() {
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  return (
    <>
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
            <div className="bg-gray-100 rounded-full p-6 sm:p-8 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <FolderPlus className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center">
              Bem-vindo ao Sistema de Tarefas
            </h2>
            <p className="text-gray-600 text-center mb-6 text-sm sm:text-base">
              Crie seu primeiro grupo para começar a organizar suas tarefas de forma colaborativa
            </p>
            <Button onClick={() => setShowCreateGroup(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Grupo
            </Button>
          </CardContent>
        </Card>
      </div>

      <CreateGroupModal open={showCreateGroup} onOpenChange={setShowCreateGroup} />
    </>
  )
}
