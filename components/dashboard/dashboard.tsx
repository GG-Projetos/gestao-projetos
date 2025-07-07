"use client"

import { useTask } from "@/contexts/task-context"
import { Sidebar } from "@/components/dashboard/sidebar"
import { KanbanBoard } from "@/components/dashboard/kanban-board"
import { EmptyState } from "@/components/dashboard/empty-state"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Dashboard() {
  const { currentGroup } = useTask()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">{currentGroup?.name || "Sistema de Tarefas"}</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">{currentGroup ? <KanbanBoard /> : <EmptyState />}</div>
      </main>
    </div>
  )
}
