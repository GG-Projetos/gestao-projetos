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
  const { createColumn } = useTask()
  const { toast } = useToast()

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

    createColumn(title.trim())

    toast({
      title: "Coluna criada!",
      description: `A coluna "${title}" foi criada com sucesso.`,
    })

    setTitle("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Coluna</DialogTitle>
          <DialogDescription>Adicione uma nova coluna ao quadro Kanban.</DialogDescription>
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
            <Button type="submit">Criar Coluna</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
