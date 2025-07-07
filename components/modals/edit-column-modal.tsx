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

  const column = columns.find((c) => c.id === columnId)

  useEffect(() => {
    if (column && open) {
      setTitle(column.title)
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

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  if (!column) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] mx-4">
        <DialogHeader>
          <DialogTitle>Editar Coluna</DialogTitle>
          <DialogDescription>Modifique o título da coluna.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Coluna</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o novo título"
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
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
