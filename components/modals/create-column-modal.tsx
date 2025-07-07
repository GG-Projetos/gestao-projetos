"use client"

import type React from "react"

import { useState } from "react"
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

interface CreateColumnModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateColumnModal({ open, onOpenChange }: CreateColumnModalProps) {
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { createColumn, currentGroup } = useTask()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título da coluna é obrigatório.",
        variant: "destructive",
      })
      return
    }

    if (!currentGroup) {
      toast({
        title: "Erro",
        description: "Nenhum grupo selecionado.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await createColumn(title.trim())

      toast({
        title: "Coluna criada",
        description: "A coluna foi criada com sucesso.",
      })

      setTitle("")
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao criar coluna:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a coluna. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setTitle("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] mx-4">
        <DialogHeader>
          <DialogTitle>Criar Nova Coluna</DialogTitle>
          <DialogDescription>Adicione uma nova coluna ao seu quadro Kanban.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Coluna</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: A Fazer, Em Progresso, Concluído"
              disabled={isLoading}
              required
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Criando..." : "Criar Coluna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
