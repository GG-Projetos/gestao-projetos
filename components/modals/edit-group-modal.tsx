"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Edit } from "lucide-react"
import { useTask } from "@/contexts/task-context"

interface EditGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
}

export function EditGroupModal({ open, onOpenChange, groupId }: EditGroupModalProps) {
  const { groups, updateGroup } = useTask()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const group = groups.find((g) => g.id === groupId)

  useEffect(() => {
    if (group) {
      setName(group.name)
      setDescription(group.description || "")
    }
  }, [group])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Nome do grupo é obrigatório")
      return
    }

    setIsLoading(true)

    try {
      console.log("🔄 Atualizando grupo:", name)
      await updateGroup(groupId, name.trim(), description.trim())
      console.log("✅ Grupo atualizado com sucesso")

      // Limpar formulário e fechar modal
      setName("")
      setDescription("")
      onOpenChange(false)
    } catch (error) {
      console.error("❌ Erro ao atualizar grupo:", error)
      setError("Erro ao atualizar grupo. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setName("")
      setDescription("")
      setError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Grupo
          </DialogTitle>
          <DialogDescription>Atualize as informações do grupo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Grupo *</Label>
              <Input
                id="name"
                placeholder="Ex: Projeto Marketing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva o objetivo do grupo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
