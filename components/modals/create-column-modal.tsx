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
import { Loader2 } from "lucide-react"

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
        title: "Título obrigatório",
        description: "Por favor, informe o título da coluna.",
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

    try {
      setIsLoading(true)
      await createColumn(title.trim())

      toast({
        title: "Coluna criada!",
        description: `A coluna "${title}" foi criada com sucesso.`,
      })

      setTitle("")
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao criar coluna:", error)
      toast({
        title: "Erro ao criar coluna",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] mx-4">
        <DialogHeader>
          <DialogTitle>Criar Nova Coluna</DialogTitle>
          <DialogDescription>
            Adicione uma nova coluna ao quadro Kanban do grupo "{currentGroup?.name}".
          </DialogDescription>
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
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
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
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Coluna"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
