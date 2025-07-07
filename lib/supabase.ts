import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Tipos para o banco de dados
export interface Profile {
  id: string
  name: string
  email: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  description?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: "owner" | "admin" | "member"
  joined_at: string
}

export interface Column {
  id: string
  title: string
  group_id: string
  order_index: number
  created_at: string
  updated_at: string
  // Aliases para compatibilidade
  groupId?: string
  order?: number
}

export interface Task {
  id: string
  title: string
  description?: string
  meta?: string
  priority: "baixa" | "media" | "alta"
  deadline: string
  column_id: string
  group_id: string
  created_by: string
  assigned_to?: string
  created_at: string
  updated_at: string
  // Aliases para compatibilidade
  columnId?: string
  groupId?: string
}
