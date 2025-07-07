"use client"

import { useTask } from "@/contexts/task-context"
import { Sidebar } from "@/components/dashboard/sidebar"
import { KanbanBoard } from "@/components/dashboard/kanban-board"
import { EmptyState } from "@/components/dashboard/empty-state"

export function Dashboard() {
  const { currentGroup } = useTask()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{currentGroup ? <KanbanBoard /> : <EmptyState />}</main>
    </div>
  )
}
