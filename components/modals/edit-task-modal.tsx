"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
  const { tasks, updateTask } = useTask()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meta: "",
    priority: "media" as "baixa" | "media" | "alta",
    deadline: "",
  })

  const task = tasks.find((t) => t.id === taskId)

  useEffect(() => {
    if (task && open) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        meta: task.meta || "",
        priority: task.priority as "baixa" | "media" | "alta",
        deadline: task.deadline ? task.deadline.split("T")[0] : "",
      })
    }
  }, [task, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório.",
        variant: "destructive",
      })
      return
    }

    if (!formData.deadline) {
      toast({
        title: "Erro",
        description: "A data limite é obrigatória.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await updateTask(taskId, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        meta: formData.meta.trim() || null,
        priority: formData.priority,
        deadline: formData.deadline,
      })

      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Digite o título da tarefa"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva a tarefa (opcional)"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta">Meta/Objetivo</Label>
            <Input
              id="meta"
              value={formData.meta}
              onChange={(e) => handleInputChange("meta", e.target.value)}
              placeholder="Qual é o objetivo desta tarefa? (opcional)"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "baixa" | "media" | "alta") => handleInputChange("priority", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">🟢 Baixa</SelectItem>
                  <SelectItem value="media">🟡 Média</SelectItem>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Data Limite *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
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
