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
  updateGroup: (groupId: string, name: string, description: string) => Promise<void>
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
  groupMemberCounts: Record<string, number>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [groupMemberCounts, setGroupMemberCounts] = useState<Record<string, number>>({})
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

  // Carregar grupos do usuário
  const fetchUserGroups = async () => {
    if (!user) {
      return
    }

    try {

      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)

      if (memberError) {
        throw memberError
      }


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
        throw groupsError
      }

      setGroups(groupsData || [])
      await fetchGroupMemberCounts(groupIds)
    } catch (error) {
      setGroups([])
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

    if (columnsError) {
      throw columnsError
    }

    const columnsWithAliases = (columnsData || []).map((col) => ({
      ...col,
      groupId: col.group_id,
      order: col.order_index,
    }))

    // Buscar tarefas
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })

    if (tasksError) {
      throw tasksError
    }

    const tasksWithAliases = (tasksData || []).map((task) => ({
      ...task,
      columnId: task.column_id,
      groupId: task.group_id,
    }))

    // Atualizar estados
    setColumns(columnsWithAliases)
    setTasks(tasksWithAliases)

    // Atualizar contagem de membros do grupo atual
    await fetchGroupMemberCounts([groupId]) // 👈 aqui está o ajuste correto

  } catch (error) {
    setColumns([])
    setTasks([])
  } finally {
    setIsLoading(false)
  }
}


  const fetchGroupMemberCounts = async (groupIds: string[]) => {
  try {
      const memberCounts: Record<string, number> = {}

      for (const groupId of groupIds) {

        const { count, error } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", groupId)

          console.log(count);
          

        if (!error && count !== null) {
          memberCounts[groupId] = count
        } else {
          memberCounts[groupId] = 0
        }
      }

      setGroupMemberCounts((prev) => ({ ...prev, ...memberCounts }))
    } catch (error) {
      console.error("Erro ao buscar contagem de membros:", error)
    }
  }



  

  const createGroup = async (name: string, description: string) => {
    if (!user) {
      throw new Error("Usuário não autenticado")
    }

    try {
      // Verificar se o usuário está realmente autenticado
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (!session) {
        throw new Error("Sessão não encontrada")
      }


      // Verificar se o perfil do usuário existe
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      if (!profileData) {
        const { error: createProfileError } = await supabase.from("profiles").insert({
          id: user.id,
          name: user.email?.split("@")[0] || "Usuário",
          email: user.email || "",
        })

        if (createProfileError) {
          throw createProfileError
        }
      } else {
      }

      // Passo 1: Criar grupo
      const groupPayload = {
        name: name.trim(),
        description: description.trim() || null,
        created_by: user.id,
      }


      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert(groupPayload)
        .select()
        .single()

      if (groupError) {

        throw groupError
      }


      // Passo 2: Adicionar criador como membro owner
      const memberPayload = {
        group_id: groupData.id,
        user_id: user.id,
        role: "owner" as const,
      }


      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .insert(memberPayload)
        .select()

      if (memberError) {

        throw memberError
      }


      // Passo 3: Criar colunas padrão
      const defaultColumns = [
        { title: "A Fazer", group_id: groupData.id, order_index: 1 },
        { title: "Em Progresso", group_id: groupData.id, order_index: 2 },
        { title: "Concluído", group_id: groupData.id, order_index: 3 },
      ]


      const { data: columnsData, error: columnsError } = await supabase.from("columns").insert(defaultColumns).select()

      if (columnsError) {
       
        throw columnsError
      }


      // Passo 4: Recarregar grupos
      await fetchUserGroups()

    } catch (error) {




      // Se o erro for um objeto vazio, criar uma mensagem mais útil
      if (error && typeof error === "object" && Object.keys(error).length === 0) {
        throw new Error("Erro desconhecido ao criar grupo. Verifique as políticas RLS no Supabase.")
      }

      throw error
    }
  }

  const updateGroup = async (groupId: string, name: string, description: string) => {
    try {

      const { error } = await supabase
        .from("groups")
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq("id", groupId)

      if (error) {
        throw error
      }


      // Recarregar grupos
      await fetchUserGroups()

      // Se o grupo atual foi atualizado, atualizar também
      if (currentGroup?.id === groupId) {
        const updatedGroup = groups.find((g) => g.id === groupId)
        if (updatedGroup) {
          setCurrentGroup({ ...updatedGroup, name, description })
        }
      }
    } catch (error) {
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
      throw error
    }
  }

  const deleteGroup = async (groupId: string) => {
    try {

      const { error } = await supabase.from("groups").delete().eq("id", groupId)

      if (error) {
        throw error
      }


      if (currentGroup?.id === groupId) {
        setCurrentGroup(null)
      }

      await fetchUserGroups()
    } catch (error) {
      throw error
    }
  }

  const createColumn = async (title: string) => {
    if (!currentGroup) {
      throw new Error("Nenhum grupo selecionado")
    }

    try {
   

      const maxOrder = Math.max(...columns.map((c) => c.order_index), 0)

      const columnPayload = {
        title: title.trim(),
        group_id: currentGroup.id,
        order_index: maxOrder + 1,
      }


      const { data, error } = await supabase.from("columns").insert(columnPayload).select().single()

      if (error) {

        throw error
      }


      // Adicionar aliases para compatibilidade
      const columnWithAliases = {
        ...data,
        groupId: data.group_id,
        order: data.order_index,
      }

      // Atualizar o estado local imediatamente
      setColumns((prevColumns) => {
        const newColumns = [...prevColumns, columnWithAliases]

        return newColumns
      })

      // Também recarregar dados do grupo para garantir sincronização
      setTimeout(() => {
        fetchGroupData(currentGroup.id)
      }, 500)

    } catch (error) {

      throw error
    }
  }

  const updateColumn = async (columnId: string, title: string, orderIndex?: number) => {
    try {

      const updates: any = { title: title.trim() }
      if (orderIndex !== undefined) {
        updates.order_index = orderIndex
      }

      const { error } = await supabase.from("columns").update(updates).eq("id", columnId)

      if (error) {
        throw error
      }


      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      throw error
    }
  }

  const deleteColumn = async (columnId: string) => {
    try {

      const { error } = await supabase.from("columns").delete().eq("id", columnId)

      if (error) {
        throw error
      }


      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      throw error
    }
  }

  const createTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at" | "created_by">) => {
    if (!user) {
      throw new Error("Usuário não autenticado")
    }

    try {

      const taskPayload = {
        title: taskData.title,
        description: taskData.description || null,
        meta: taskData.meta || null,
        priority: taskData.priority,
        deadline: taskData.deadline,
        column_id: taskData.column_id || taskData.columnId,
        group_id: taskData.group_id || taskData.groupId,
        created_by: user.id,
      }


      const { error } = await supabase.from("tasks").insert(taskPayload)

      if (error) {
        throw error
      }


      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
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
      throw error
    }
  }

  const moveTask = async (taskId: string, newColumnId: string) => {
    try {

      const { error } = await supabase.from("tasks").update({ column_id: newColumnId }).eq("id", taskId)

      if (error) {
        throw error
      }

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
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
        updateGroup,
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
        groupMemberCounts
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
