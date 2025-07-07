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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTask } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"

interface EditTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
}

export function EditTaskModal({ open, onOpenChange, taskId }: EditTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [meta, setMeta] = useState("")
  const [priority, setPriority] = useState<"baixa" | "media" | "alta">("media")
  const [deadline, setDeadline] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { tasks, updateTask } = useTask()
  const { toast } = useToast()

  const task = tasks.find((t) => t.id === taskId)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setMeta(task.meta || "")
      setPriority(task.priority)
      setDeadline(task.deadline)
    }
  }, [task])

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

    if (!deadline) {
      toast({
        title: "Prazo obrigatório",
        description: "Por favor, informe o prazo da tarefa.",
        variant: "destructive",
      })
      return
    }

    if (!task) {
      toast({
        title: "Tarefa não encontrada",
        description: "A tarefa que você está tentando editar não foi encontrada.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      console.log("🔄 Atualizando tarefa:", taskId)

      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        meta: meta.trim() || undefined,
        priority,
        deadline,
      })

      console.log("✅ Tarefa atualizada com sucesso")

      toast({
        title: "Tarefa atualizada!",
        description: `A tarefa "${title}" foi atualizada com sucesso.`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("❌ Erro ao atualizar tarefa:", error)
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Ocorreu um erro ao atualizar a tarefa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!task) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>Altere as informações da tarefa "{task.title}".</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Digite o título da tarefa..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva a tarefa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meta">Meta (opcional)</Label>
              <Input
                id="meta"
                placeholder="Ex: Aumentar vendas em 20%..."
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade *</Label>
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
                <Label htmlFor="deadline">Prazo *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
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
