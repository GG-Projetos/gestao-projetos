"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTask } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"

interface CreateColumnModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateColumnModal({ open, onOpenChange }: CreateColumnModalProps) {
  const { createColumn, currentGroup } = useTask()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Coluna</DialogTitle>
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

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Criando..." : "Criar Coluna"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
