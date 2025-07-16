// components/modals/view-task-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, User } from "lucide-react"

interface ViewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: {
    title: string
    description: string
    deadline: string
    assigned_to?: string
    priority: string
    meta?: string
  }
}

export function ViewTaskModal({ open, onOpenChange, task }: ViewTaskModalProps) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-gray-700">
          {task.description && <p>{task.description}</p>}

          {task.meta && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
              <p className="text-sm text-blue-800 font-medium break-words">Meta: {task.meta}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(task.deadline)}</span>
          </div>

          {task.assigned_to && (
            <div className="flex items-center gap-2 text-gray-500">
              <User className="h-4 w-4" />
              <span>Atribuído a: {task.assigned_to}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
