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
      console.log("🔄 Usuário logado, carregando grupos para:", user.email)
      fetchUserGroups()
    } else {
      console.log("❌ Usuário não logado, limpando dados")
      setGroups([])
      setColumns([])
      setTasks([])
      setCurrentGroup(null)
    }
  }, [user])

  // Carregar colunas e tarefas quando o grupo atual muda
  useEffect(() => {
    if (currentGroup) {
      console.log("🔄 Grupo atual mudou para:", currentGroup.name)
      fetchGroupData(currentGroup.id)
    } else {
      setColumns([])
      setTasks([])
    }
  }, [currentGroup])

  // Carregar grupos do usuário
  const fetchUserGroups = async () => {
    if (!user) {
      console.log("❌ Sem usuário para buscar grupos")
      return
    }

    try {
      console.log("🔍 Buscando grupos para usuário:", user.id)

      // Primeiro, buscar os IDs dos grupos que o usuário participa
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)

      if (memberError) {
        console.error("❌ Erro ao buscar memberships:", memberError)
        throw memberError
      }

      console.log("✅ Memberships encontrados:", memberData)

      // Se não há memberships, retorna array vazio
      if (!memberData || memberData.length === 0) {
        console.log("ℹ️ Usuário não participa de nenhum grupo")
        setGroups([])
        return
      }

      // Extrair os IDs dos grupos
      const groupIds = memberData.map((member) => member.group_id)
      console.log("🔍 IDs dos grupos:", groupIds)

      // Buscar os dados completos dos grupos
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds)
        .order("created_at", { ascending: false })

      if (groupsError) {
        console.error("❌ Erro ao buscar grupos:", groupsError)
        throw groupsError
      }

      console.log("✅ Grupos encontrados:", groupsData)
      setGroups(groupsData || [])
    } catch (error) {
      console.error("❌ Erro ao buscar grupos:", error)
      setGroups([])
    }
  }

  const fetchGroupData = async (groupId: string) => {
    try {
      setIsLoading(true)
      console.log("🔄 Carregando dados do grupo:", groupId)

      // Buscar colunas
      const { data: columnsData, error: columnsError } = await supabase
        .from("columns")
        .select("*")
        .eq("group_id", groupId)
        .order("order_index", { ascending: true })

      if (columnsError) {
        console.error("❌ Erro ao buscar colunas:", columnsError)
        throw columnsError
      }

      // Buscar tarefas
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })

      if (tasksError) {
        console.error("❌ Erro ao buscar tarefas:", tasksError)
        throw tasksError
      }

      console.log("✅ Colunas encontradas:", columnsData?.length || 0)
      console.log("✅ Tarefas encontradas:", tasksData?.length || 0)

      setColumns(columnsData || [])
      setTasks(tasksData || [])
    } catch (error) {
      console.error("❌ Erro ao buscar dados do grupo:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createGroup = async (name: string, description: string) => {
    if (!user) {
      console.error("❌ Usuário não autenticado")
      throw new Error("Usuário não autenticado")
    }

    console.log("=== 🚀 INICIANDO CRIAÇÃO DO GRUPO ===")
    console.log("📝 Nome:", name)
    console.log("📝 Descrição:", description)
    console.log("👤 Usuário ID:", user.id)
    console.log("📧 Usuário Email:", user.email)

    try {
      // Verificar se o usuário está realmente autenticado
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("❌ Erro ao verificar sessão:", sessionError)
        throw sessionError
      }

      if (!session) {
        console.error("❌ Sessão não encontrada")
        throw new Error("Sessão não encontrada")
      }

      console.log("✅ Sessão válida encontrada para:", session.user.email)

      // Verificar se o perfil do usuário existe
      console.log("🔍 Verificando se perfil existe...")
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("❌ Erro ao verificar perfil:", profileError)
        throw profileError
      }

      if (!profileData) {
        console.log("⚠️ Perfil não encontrado, criando...")
        const { error: createProfileError } = await supabase.from("profiles").insert({
          id: user.id,
          name: user.email?.split("@")[0] || "Usuário",
          email: user.email || "",
        })

        if (createProfileError) {
          console.error("❌ Erro ao criar perfil:", createProfileError)
          throw createProfileError
        }
        console.log("✅ Perfil criado com sucesso")
      } else {
        console.log("✅ Perfil encontrado:", profileData.email)
      }

      // Passo 1: Criar grupo
      console.log("🔄 Passo 1: Criando grupo...")
      const groupPayload = {
        name: name.trim(),
        description: description.trim() || null,
        created_by: user.id,
      }

      console.log("📤 Payload do grupo:", JSON.stringify(groupPayload, null, 2))

      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert(groupPayload)
        .select()
        .single()

      if (groupError) {
        console.error("❌ ERRO ao criar grupo:", groupError)
        console.error("❌ Código do erro:", groupError.code)
        console.error("❌ Mensagem do erro:", groupError.message)
        console.error("❌ Detalhes completos:", JSON.stringify(groupError, null, 2))
        throw groupError
      }

      console.log("✅ Grupo criado com sucesso:", groupData)

      // Passo 2: Adicionar criador como membro owner
      console.log("🔄 Passo 2: Adicionando usuário como owner...")
      const memberPayload = {
        group_id: groupData.id,
        user_id: user.id,
        role: "owner" as const,
      }

      console.log("📤 Payload do membro:", JSON.stringify(memberPayload, null, 2))

      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .insert(memberPayload)
        .select()

      if (memberError) {
        console.error("❌ ERRO ao adicionar membro:", memberError)
        console.error("❌ Código do erro:", memberError.code)
        console.error("❌ Mensagem do erro:", memberError.message)
        console.error("❌ Detalhes completos:", JSON.stringify(memberError, null, 2))
        throw memberError
      }

      console.log("✅ Usuário adicionado como owner:", memberData)

      // Passo 3: Criar colunas padrão
      console.log("🔄 Passo 3: Criando colunas padrão...")
      const defaultColumns = [
        { title: "A Fazer", group_id: groupData.id, order_index: 1 },
        { title: "Em Progresso", group_id: groupData.id, order_index: 2 },
        { title: "Concluído", group_id: groupData.id, order_index: 3 },
      ]

      console.log("📤 Payload das colunas:", JSON.stringify(defaultColumns, null, 2))

      const { data: columnsData, error: columnsError } = await supabase.from("columns").insert(defaultColumns).select()

      if (columnsError) {
        console.error("❌ ERRO ao criar colunas:", columnsError)
        console.error("❌ Código do erro:", columnsError.code)
        console.error("❌ Mensagem do erro:", columnsError.message)
        console.error("❌ Detalhes completos:", JSON.stringify(columnsError, null, 2))
        throw columnsError
      }

      console.log("✅ Colunas padrão criadas:", columnsData)

      // Passo 4: Recarregar grupos
      console.log("🔄 Passo 4: Recarregando lista de grupos...")
      await fetchUserGroups()

      console.log("🎉 GRUPO CRIADO COM SUCESSO COMPLETO!")
    } catch (error) {
      console.error("❌ ERRO DETALHADO ao criar grupo:")
      console.error("❌ Tipo do erro:", typeof error)
      console.error("❌ Erro completo:", error)

      if (error && typeof error === "object") {
        console.error("❌ Propriedades do erro:", Object.keys(error))
        console.error("❌ JSON do erro:", JSON.stringify(error, null, 2))
      }

      // Se o erro for um objeto vazio, criar uma mensagem mais útil
      if (error && typeof error === "object" && Object.keys(error).length === 0) {
        throw new Error("Erro desconhecido ao criar grupo. Verifique as políticas RLS no Supabase.")
      }

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
