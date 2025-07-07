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
      console.log("🔄 Nenhum grupo selecionado, limpando colunas e tarefas")
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
      console.log("🔍 Buscando colunas do grupo...")
      const { data: columnsData, error: columnsError } = await supabase
        .from("columns")
        .select("*")
        .eq("group_id", groupId)
        .order("order_index", { ascending: true })

      if (columnsError) {
        console.error("❌ Erro ao buscar colunas:", columnsError)
        throw columnsError
      }

      console.log("✅ Colunas encontradas:", columnsData?.length || 0, columnsData)

      // Adicionar aliases para compatibilidade
      const columnsWithAliases = (columnsData || []).map((col) => ({
        ...col,
        groupId: col.group_id,
        order: col.order_index,
      }))

      console.log("🔄 Colunas com aliases:", columnsWithAliases)

      // Buscar tarefas
      console.log("🔍 Buscando tarefas do grupo...")
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })

      if (tasksError) {
        console.error("❌ Erro ao buscar tarefas:", tasksError)
        throw tasksError
      }

      console.log("✅ Tarefas encontradas:", tasksData?.length || 0, tasksData)

      // Adicionar aliases para compatibilidade
      const tasksWithAliases = (tasksData || []).map((task) => ({
        ...task,
        columnId: task.column_id,
        groupId: task.group_id,
      }))

      // Atualizar estados
      setColumns(columnsWithAliases)
      setTasks(tasksWithAliases)

      console.log("🎉 Dados do grupo carregados com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao buscar dados do grupo:", error)
      setColumns([])
      setTasks([])
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

  const updateGroup = async (groupId: string, name: string, description: string) => {
    try {
      console.log("🔄 Atualizando grupo:", groupId)

      const { error } = await supabase
        .from("groups")
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq("id", groupId)

      if (error) {
        console.error("❌ Erro ao atualizar grupo:", error)
        throw error
      }

      console.log("✅ Grupo atualizado com sucesso")

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
      console.error("❌ Erro ao atualizar grupo:", error)
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
      console.log("🗑️ Excluindo grupo:", groupId)

      const { error } = await supabase.from("groups").delete().eq("id", groupId)

      if (error) {
        console.error("❌ Erro ao excluir grupo:", error)
        throw error
      }

      console.log("✅ Grupo excluído com sucesso")

      if (currentGroup?.id === groupId) {
        setCurrentGroup(null)
      }

      await fetchUserGroups()
    } catch (error) {
      console.error("❌ Erro ao excluir grupo:", error)
      throw error
    }
  }

  const createColumn = async (title: string) => {
    if (!currentGroup) {
      console.error("❌ Nenhum grupo selecionado para criar coluna")
      throw new Error("Nenhum grupo selecionado")
    }

    try {
      console.log("=== 🚀 INICIANDO CRIAÇÃO DA COLUNA ===")
      console.log("📝 Título:", title)
      console.log("🏢 Grupo:", currentGroup.name, currentGroup.id)
      console.log("📊 Colunas atuais:", columns.length)

      const maxOrder = Math.max(...columns.map((c) => c.order_index), 0)
      console.log("📈 Próxima ordem:", maxOrder + 1)

      const columnPayload = {
        title: title.trim(),
        group_id: currentGroup.id,
        order_index: maxOrder + 1,
      }

      console.log("📤 Payload da coluna:", JSON.stringify(columnPayload, null, 2))

      const { data, error } = await supabase.from("columns").insert(columnPayload).select().single()

      if (error) {
        console.error("❌ ERRO ao criar coluna:", error)
        console.error("❌ Código do erro:", error.code)
        console.error("❌ Mensagem do erro:", error.message)
        console.error("❌ Detalhes completos:", JSON.stringify(error, null, 2))
        throw error
      }

      console.log("✅ Coluna criada com sucesso:", data)

      // Adicionar aliases para compatibilidade
      const columnWithAliases = {
        ...data,
        groupId: data.group_id,
        order: data.order_index,
      }

      // Atualizar o estado local imediatamente
      console.log("🔄 Atualizando estado local das colunas...")
      setColumns((prevColumns) => {
        const newColumns = [...prevColumns, columnWithAliases]
        console.log(
          "📊 Novas colunas no estado:",
          newColumns.length,
          newColumns.map((c) => c.title),
        )
        return newColumns
      })

      // Também recarregar dados do grupo para garantir sincronização
      console.log("🔄 Recarregando dados do grupo para sincronização...")
      setTimeout(() => {
        fetchGroupData(currentGroup.id)
      }, 500)

      console.log("🎉 COLUNA CRIADA COM SUCESSO COMPLETO!")
    } catch (error) {
      console.error("❌ ERRO DETALHADO ao criar coluna:")
      console.error("❌ Tipo do erro:", typeof error)
      console.error("❌ Erro completo:", error)
      throw error
    }
  }

  const updateColumn = async (columnId: string, title: string, orderIndex?: number) => {
    try {
      console.log("🔄 Atualizando coluna:", columnId, title)

      const updates: any = { title: title.trim() }
      if (orderIndex !== undefined) {
        updates.order_index = orderIndex
      }

      const { error } = await supabase.from("columns").update(updates).eq("id", columnId)

      if (error) {
        console.error("❌ Erro ao atualizar coluna:", error)
        throw error
      }

      console.log("✅ Coluna atualizada com sucesso")

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar coluna:", error)
      throw error
    }
  }

  const deleteColumn = async (columnId: string) => {
    try {
      console.log("🗑️ Excluindo coluna:", columnId)

      const { error } = await supabase.from("columns").delete().eq("id", columnId)

      if (error) {
        console.error("❌ Erro ao excluir coluna:", error)
        throw error
      }

      console.log("✅ Coluna excluída com sucesso")

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      console.error("❌ Erro ao excluir coluna:", error)
      throw error
    }
  }

  const createTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at" | "created_by">) => {
    if (!user) {
      console.error("❌ Usuário não autenticado para criar tarefa")
      throw new Error("Usuário não autenticado")
    }

    try {
      console.log("🔄 Criando tarefa:", taskData)

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

      console.log("📤 Payload da tarefa:", JSON.stringify(taskPayload, null, 2))

      const { error } = await supabase.from("tasks").insert(taskPayload)

      if (error) {
        console.error("❌ Erro ao criar tarefa:", error)
        throw error
      }

      console.log("✅ Tarefa criada com sucesso")

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      console.error("❌ Erro ao criar tarefa:", error)
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
      console.log("🔄 Movendo tarefa:", taskId, "para coluna:", newColumnId)

      const { error } = await supabase.from("tasks").update({ column_id: newColumnId }).eq("id", taskId)

      if (error) {
        console.error("❌ Erro ao mover tarefa:", error)
        throw error
      }

      console.log("✅ Tarefa movida com sucesso")

      if (currentGroup) {
        await fetchGroupData(currentGroup.id)
      }
    } catch (error) {
      console.error("❌ Erro ao mover tarefa:", error)
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
