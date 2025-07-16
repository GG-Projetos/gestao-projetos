"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Users, Settings, LogOut, MoreVertical, FolderPlus, Edit, Trash2, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTask } from "@/contexts/task-context"
import { CreateGroupModal } from "@/components/modals/create-group-modal"
import { EditGroupModal } from "@/components/modals/edit-group-modal"

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const { groups, currentGroup, setCurrentGroup, deleteGroup,groupMemberCounts,leaveGroup} = useTask()
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<{ id: string; name: string } | null>(null)
  const [leavingGroup, setLeavingGroup] = useState<{ id: string, name: string} | null>(null)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
    }
  }

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return

    try {
      await deleteGroup(deletingGroup.id)
      setDeletingGroup(null)
    } catch (error) {
    }
  }

  const handleLeaveGroup = async () => {
    if (!currentGroup) return

    try {
      await leaveGroup(currentGroup.id)

      setleavingGroup(null)
    } catch (error) {
    }
  }


  const handleGroupSelect = (group: any) => {
    setCurrentGroup(group)
    onClose?.() // Close sidebar on mobile after selection
  }

  const getUserInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <div className="w-full h-full bg-background border-r flex flex-col">
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Header do usuário */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{user?.email ? getUserInitials(user.email) : "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Seção de Grupos */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground">GRUPOS</h2>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowCreateGroup(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {groups.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <FolderPlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Você ainda não participa de nenhum grupo
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setShowCreateGroup(true)} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Grupo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-2">
                  {groups.map((group) => (
                    <Card
                      key={group.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        currentGroup?.id === group.id ? "bg-accent border-primary" : ""
                      }`}
                      onClick={() => handleGroupSelect(group)}
                    >
                      <CardHeader className="p-3">
                        <div className="flex items-center justify-between min-w-0">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-medium truncate">{group.name}</CardTitle>
                            {group.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{group.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <Badge variant="secondary" className="text-xs">
                              <Users className="mr-1 h-3 w-3" />
                              {groupMemberCounts[group.id] ?? 0}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingGroup(group.id)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeletingGroup({ id: group.id, name: group.name })
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>

                                 {group.created_by !== user?.id && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setLeavingGroup({ id: group.id, name: group.name })
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Sair do Grupo
                                    </DropdownMenuItem>
                                  )}


                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Separator />

          {/* Ações rápidas */}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => setShowCreateGroup(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </div>
        </div>
      </div>

      {/* Modais */}
      <CreateGroupModal open={showCreateGroup} onOpenChange={setShowCreateGroup} />

      {editingGroup && (
        <EditGroupModal open={!!editingGroup} onOpenChange={() => setEditingGroup(null)} groupId={editingGroup} />
      )}

      {/* Dialog de confirmação para excluir */}
      <AlertDialog open={!!deletingGroup} onOpenChange={() => setDeletingGroup(null)}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo "{deletingGroup?.name}"? Esta ação não pode ser desfeita e todos os
              dados do grupo serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!leavingGroup} onOpenChange={() => setLeavingGroup(null)}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do Grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair do grupo "{leavingGroup?.name}"? Você não poderá mais acessar as tarefas deste grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGroup} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
