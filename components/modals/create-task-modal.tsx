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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTask } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columnId: string
  groupId: string
}

export function CreateTaskModal({ open, onOpenChange, columnId, groupId }: CreateTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"baixa" | "media" | "alta">("media")
  const [deadline, setDeadline] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { createTask, columns } = useTask()
  const { toast } = useToast()

  const column = columns.find((c) => c.id === columnId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, informe o título da tarefa.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await createTask({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        deadline: deadline || null,
        column_id: columnId,
        group_id: groupId,
        meta: null,
      })

      toast({
        title: "Tarefa criada!",
        description: `A tarefa "${title}" foi criada com sucesso.`,
      })

      setTitle("")
      setDescription("")
      setPriority("media")
      setDeadline("")
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao criar tarefa:", error)
      toast({
        title: "Erro ao criar tarefa",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] mx-4">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
          <DialogDescription>Adicione uma nova tarefa na coluna "{column?.title}".</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título da Tarefa *</Label>
              <Input
                id="title"
                placeholder="Digite o título da tarefa..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva os detalhes da tarefa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={priority}
                  onValueChange={(value: "baixa" | "media" | "alta") => setPriority(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">🟢 Baixa</SelectItem>
                    <SelectItem value="media">🟡 Média</SelectItem>
                    <SelectItem value="alta">🔴 Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="deadline">Prazo</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={isLoading}
                />
              </div>
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
                "Criar Tarefa"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
