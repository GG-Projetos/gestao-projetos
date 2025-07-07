import { createClient } from "@supabase/supabase-js"

/**
 * Configuração do Supabase com suas credenciais reais
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ykzyuhcmvfpfyyykwfnn.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrenl1aGNtdmZwZnl5eWt3Zm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDM4NDYsImV4cCI6MjA2NzQ3OTg0Nn0.7vxhXWVURboGQPCu6HkzvrMjjYPBD61cjl7ayMgZAYo"

// Agora o Supabase está sempre pronto com suas credenciais
export const supabaseIsReady = true

/**
 * Cliente Supabase configurado com suas credenciais
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Tipos do banco de dados
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
}
