"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase, type Group, type Column, type Task } from "@/lib/supabase"
import { useAuth } from "./auth-context"

interface TaskContextType {
  groups: Group[]
  columns: Column[]
  tasks: Task[]
  currentGroup: Group | null
  isLoading: boolean
  createGroup: (name: string, description: string) => Promise<void>
  joinGroup: (groupId: string) => Promise<void>
  leaveGroup: (groupId: string) => Promise<void>
  deleteGroup: (groupId: string) => Promise<void>
  setCurrentGroup: (group: Group | null) => void
  createColumn: (title: string) => Promise<void>
  updateColumn: (columnId: string, title: string, orderIndex?: number) => Promise<void>
  deleteColumn: (columnId: string) => Promise<void>
  createTask: (task: Omit<Task, "id" | "created_at" | "updated_at" | "created_by">) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  moveTask: (taskId: string, newColumnId: string) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar grupos do usuário
  useEffect(() => {
    if (user) {
      fetchUserGroups()
    } else {
      setGroups([])
      setColumns([])
      setTasks([])
      setCurrentGroup(null)
    }
  }, [user])

  // Carregar colunas e tarefas quando o grupo atual muda
  useEffect(() => {
    if (currentGroup) {
      fetchGroupData(currentGroup.id)
    } else {
      setColumns([])
      setTasks([])
    }
  }, [currentGroup])

  // Carregar grupos do usuário com abordagem mais robusta
  const fetchUserGroups = async () => {
    if (!user) return

    try {
      // Primeiro, buscar os IDs dos grupos que o usuário participa
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)

      if (memberError) {
        console.error("Erro ao buscar memberships:", memberError)
        throw memberError
      }

      // Se não há memberships, retorna array vazio
      if (!memberData || memberData.length === 0) {
        setGroups([])
        return
      }

      // Extrair os IDs dos grupos
      const groupIds = memberData.map((member) => member.group_id)

      // Buscar os dados completos dos grupos
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds)
        .order("created_at", { ascending: false })

      if (groupsError) {
        console.error("Erro ao buscar grupos:", groupsError)
        throw groupsError
      }

      setGroups(groupsData || [])
    } catch (error) {
      console.error("Erro ao buscar grupos:", error)
      setGroups([]) // Garantir que não fica em estado indefinido
    }
  }

  const fetchGroupData = async (groupId: string) => {
    try {
      setIsLoading(true)

      // Buscar colunas
      const { data: columnsData, error: columnsError } = await supabase
        .from("columns")
        .select("*")
        .eq("group_id", groupId)
        .order("order_index", { ascending: true })

      if (columnsError) throw columnsError

      // Buscar tarefas
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })

      if (tasksError) throw tasksError

      setColumns(columnsData || [])
      setTasks(tasksData || [])
    } catch (error) {
      console.error("Erro ao buscar dados do grupo:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createGroup = async (name: string, description: string) => {
    if (!user) {
      throw new Error("Usuário não autenticado")
    }

    console.log("Iniciando criação do grupo:", { name, description, userId: user.id })

    try {
      // Criar grupo
      console.log("Criando grupo...")
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert({
          name,
          description,
          created_by: user.id,
        })
        .select()
        .single()

      if (groupError) {
        console.error("Erro ao criar grupo:", groupError)
        throw groupError
      }

      console.log("Grupo criado com sucesso:", groupData)

      // Adicionar criador como membro owner
      console.log("Adicionando usuário como owner...")
      const { error: memberError } = await supabase.from("group_members").insert({
        group_id: groupData.id,
        user_id: user.id,
        role: "owner",
      })

      if (memberError) {
        console.error("Erro ao adicionar membro:", memberError)
        throw memberError
      }

      console.log("Usuário adicionado como owner com sucesso")

      // Criar colunas padrão
      console.log("Criando colunas padrão...")
      const defaultColumns = [
        { title: "A Fazer", group_id: groupData.id, order_index: 1 },
        { title: "Em Progresso", group_id: groupData.id, order_index: 2 },
        { title: "Concluído", group_id: groupData.id, order_index: 3 },
      ]

      const { error: columnsError } = await supabase.from("columns").insert(defaultColumns)

      if (columnsError) {
        console.error("Erro ao criar colunas:", columnsError)
        throw columnsError
      }

      console.log("Colunas padrão criadas com sucesso")

      // Recarregar grupos
      await fetchUserGroups()
      console.log("Grupo criado completamente!")
    } catch (error) {
      console.error("Erro detalhado ao criar grupo:", error)
      throw error
    }
  }

  const joinGroup = async (groupId: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: user.id,
        role: "member",
      })

      if (error) throw error
      await fetchUserGroups()
    } catch (error) {
      console.error("Erro ao entrar no grupo:", error)
      throw error
    }
  }

  const leaveGroup = async (groupId: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id)

      if (error) throw error
      await fetchUserGroups()
    } catch (error) {
      console.error("Erro ao sair do grupo:", error)
      throw error
    }
  }

  const deleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase.from("groups").delete().eq("id", groupId)

      if (error) throw error

      if (currentGroup?.id === groupId) {
        setCurrentGroup(null)
      }

      await fetchUserGroups()
    } catch (error) {
      console.error("Erro ao excluir grupo:", error)
      throw error
    }
  }

  const createColumn = async (title: string) => {
    if (!currentGroup) return

    try {
      const maxOrder = Math.max(...columns.map((c) => c.order_index), 0)

      const { error } = await supabase.from("columns").insert({
        title,
        group_id: currentGroup.id,
        order_index: maxOrder + 1,
      })

      if (error) throw error
      await fetchGroupData(currentGroup.id)
    } catch (error) {
      console.error("Erro ao criar coluna:", error)
      throw error
    }
  }

  const updateColumn = async (columnId: string, title: string, orderIndex?: number) => {
    try {
      const updates: any = { title }
      if (orderIndex !== undefined) {
        updates.order_index = orderIndex
      }

      const { error } = await supabase.from("columns").update(updates).eq("id", columnId)

      if (error) throw error

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      console.error("Erro ao atualizar coluna:", error)
      throw error
    }
  }

  const deleteColumn = async (columnId: string) => {
    try {
      const { error } = await supabase.from("columns").delete().eq("id", columnId)

      if (error) throw error

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      console.error("Erro ao excluir coluna:", error)
      throw error
    }
  }

  const createTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at" | "created_by">) => {
    if (!user) return

    try {
      const { error } = await supabase.from("tasks").insert({
        ...taskData,
        created_by: user.id,
      })

      if (error) throw error

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      console.error("Erro ao criar tarefa:", error)
      throw error
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase.from("tasks").update(updates).eq("id", taskId)

      if (error) throw error

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
      throw error
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error)
      throw error
    }
  }

  const moveTask = async (taskId: string, newColumnId: string) => {
    try {
      const { error } = await supabase.from("tasks").update({ column_id: newColumnId }).eq("id", taskId)

      if (error) throw error

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      console.error("Erro ao mover tarefa:", error)
      throw error
    }
  }

  return (
    <TaskContext.Provider
      value={{
        groups,
        columns,
        tasks,
        currentGroup,
        isLoading,
        createGroup,
        joinGroup,
        leaveGroup,
        deleteGroup,
        setCurrentGroup,
        createColumn,
        updateColumn,
        deleteColumn,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider")
  }
  return context
}
