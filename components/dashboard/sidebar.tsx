"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { useTask } from "@/contexts/task-context"
import { CreateGroupModal } from "@/components/modals/create-group-modal"
import { LogOut, Plus, Users, Settings, Trash2, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export function Sidebar() {
  const { profile, logout } = useAuth()
  const { groups, currentGroup, setCurrentGroup, deleteGroup, isLoading } = useTask()
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const { toast } = useToast()

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (confirm(`Tem certeza que deseja excluir o grupo "${groupName}"?`)) {
      try {
        await deleteGroup(groupId)
        toast({
          title: "Grupo excluído",
          description: `O grupo "${groupName}" foi excluído com sucesso.`,
        })
      } catch (error) {
        toast({
          title: "Erro ao excluir grupo",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Olá, {profile?.name}</h2>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Groups */}
        <div className="flex-1 flex flex-col">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Meus Grupos</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateGroup(true)} title="Criar novo grupo">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        currentGroup?.id === group.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1 min-w-0" onClick={() => setCurrentGroup(group)}>
                        <p className="font-medium truncate">{group.name}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          Grupo colaborativo
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteGroup(group.id, group.name)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir grupo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}

                {!isLoading && groups.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum grupo ainda</p>
                    <p className="text-xs">Crie seu primeiro grupo!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <CreateGroupModal open={showCreateGroup} onOpenChange={setShowCreateGroup} />
    </>
  )
}
