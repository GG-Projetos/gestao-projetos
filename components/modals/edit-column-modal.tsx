"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTask } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"

interface EditColumnModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columnId: string
}

export function EditColumnModal({ open, onOpenChange, columnId }: EditColumnModalProps) {
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { columns, updateColumn } = useTask()
  const { toast } = useToast()

  const column = columns.find((col) => col.id === columnId)

  useEffect(() => {
    if (column) {
      setTitle(column.title)
    }
  }, [column])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, informe o título da coluna.",
        variant: "destructive",
      })
      return
    }

    if (!column) {
      toast({
        title: "Coluna não encontrada",
        description: "A coluna que você está tentando editar não foi encontrada.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      console.log("🔄 Atualizando coluna:", columnId, title)

      await updateColumn(columnId, title.trim())

      console.log("✅ Coluna atualizada com sucesso")

      toast({
        title: "Coluna atualizada!",
        description: `A coluna foi renomeada para "${title}".`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("❌ Erro ao atualizar coluna:", error)
      toast({
        title: "Erro ao atualizar coluna",
        description: "Ocorreu um erro ao atualizar a coluna. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!column) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Coluna</DialogTitle>
          <DialogDescription>Altere o título da coluna "{column.title}".</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título da Coluna *</Label>
              <Input
                id="title"
                placeholder="Ex: Em Revisão, Aguardando Aprovação..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
