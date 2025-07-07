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
import { Plus, Users, Settings, LogOut, MoreVertical, FolderPlus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTask } from "@/contexts/task-context"
import { CreateGroupModal } from "@/components/modals/create-group-modal"

export function Sidebar() {
  const { user, logout } = useAuth()
  const { groups, currentGroup, setCurrentGroup } = useTask()
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
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
      <div className="w-80 bg-background border-r flex flex-col h-full">
        {/* Header do usuário */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
        <div className="flex-1 flex flex-col">
          <div className="p-4">
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
                <div className="space-y-2">
                  {groups.map((group) => (
                    <Card
                      key={group.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        currentGroup?.id === group.id ? "bg-accent border-primary" : ""
                      }`}
                      onClick={() => setCurrentGroup(group)}
                    >
                      <CardHeader className="p-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium truncate">{group.name}</CardTitle>
                          <Badge variant="secondary" className="ml-2">
                            <Users className="mr-1 h-3 w-3" />
                            {/* Aqui você pode adicionar o número de membros */}
                          </Badge>
                        </div>
                        {group.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{group.description}</p>
                        )}
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

      <CreateGroupModal open={showCreateGroup} onOpenChange={setShowCreateGroup} />
    </>
  )
}
