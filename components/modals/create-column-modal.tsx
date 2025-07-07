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

  const resetForm = () => {
    setTitle("")
  }

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

    if (!currentGroup) {
      toast({
        title: "Grupo não selecionado",
        description: "Selecione um grupo antes de criar a coluna.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      console.log("🔄 Iniciando criação de coluna:", title)

      await createColumn(title.trim())

      console.log("✅ Coluna criada com sucesso, fechando modal")

      toast({
        title: "Coluna criada!",
        description: `A coluna "${title}" foi criada com sucesso.`,
      })

      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("❌ Erro ao criar coluna:", error)
      toast({
        title: "Erro ao criar coluna",
        description: "Ocorreu um erro ao criar a coluna. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Coluna</DialogTitle>
          <DialogDescription>Criar uma nova coluna no grupo "{currentGroup?.name || "Grupo"}"</DialogDescription>
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
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Coluna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
