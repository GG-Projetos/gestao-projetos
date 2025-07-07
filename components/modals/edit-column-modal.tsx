"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
  const { columns, updateColumn } = useTask()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const column = columns.find((c) => c.id === columnId)

  useEffect(() => {
    if (column && open) {
      setTitle(column.title || "")
    }
  }, [column, open])

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

    setIsLoading(true)

    try {
      await updateColumn(columnId, title.trim())

      toast({
        title: "Coluna atualizada",
        description: "A coluna foi atualizada com sucesso.",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao atualizar coluna:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a coluna. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!column) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar Coluna</DialogTitle>
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
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
