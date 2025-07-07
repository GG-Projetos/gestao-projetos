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

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columnId: string
}

export function CreateTaskModal({ open, onOpenChange, columnId }: CreateTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [meta, setMeta] = useState("")
  const [priority, setPriority] = useState<"baixa" | "media" | "alta">("media")
  const [deadline, setDeadline] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { createTask, currentGroup, columns } = useTask()
  const { toast } = useToast()

  const column = columns.find((col) => col.id === columnId)

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setMeta("")
    setPriority("media")
    setDeadline("")
  }

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

    if (!currentGroup) {
      toast({
        title: "Grupo não selecionado",
        description: "Selecione um grupo antes de criar a tarefa.",
        variant: "destructive",
      })
      return
    }

    if (!columnId) {
      toast({
        title: "Coluna não selecionada",
        description: "Selecione uma coluna para criar a tarefa.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      console.log("🔄 Criando tarefa na coluna:", columnId)

      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        meta: meta.trim() || undefined,
        priority,
        deadline,
        column_id: columnId,
        group_id: currentGroup.id,
      })

      console.log("✅ Tarefa criada com sucesso")

      toast({
        title: "Tarefa criada!",
        description: `A tarefa "${title}" foi criada com sucesso.`,
      })

      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("❌ Erro ao criar tarefa:", error)
      toast({
        title: "Erro ao criar tarefa",
        description: "Ocorreu um erro ao criar a tarefa. Tente novamente.",
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Criar uma nova tarefa na coluna "{column?.title || "Coluna"}"
            {currentGroup && ` do grupo "${currentGroup.name}"`}
          </DialogDescription>
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
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
