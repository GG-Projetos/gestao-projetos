"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTask } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columnId: string
}

export function CreateTaskModal({ open, onOpenChange, columnId }: CreateTaskModalProps) {
  const { createTask, currentGroup } = useTask()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meta: "",
    priority: "media" as "baixa" | "media" | "alta",
    deadline: "",
  })

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
      await createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        meta: formData.meta.trim() || null,
        priority: formData.priority,
        deadline: formData.deadline,
        column_id: columnId,
        group_id: currentGroup.id,
        assigned_to: null,
      })

      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso.",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        meta: "",
        priority: "media",
        deadline: "",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao criar tarefa:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
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
              {isLoading ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
