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
  const { columns, updateColumn } = useTask()
  const { toast } = useToast()

  const column = columns.find((c) => c.id === columnId)

  useEffect(() => {
    if (column) {
      setTitle(column.title)
    }
  }, [column])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, informe o título da coluna.",
        variant: "destructive",
      })
      return
    }

    updateColumn(columnId, title.trim()) // Removido o terceiro parâmetro

    toast({
      title: "Coluna atualizada!",
      description: `A coluna foi atualizada com sucesso.`,
    })

    onOpenChange(false)
  }

  if (!column) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Coluna</DialogTitle>
          <DialogDescription>Altere o título da coluna.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título da Coluna *</Label>
              <Input
                id="title"
                placeholder="Ex: A Fazer, Em Progresso, Concluído..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
