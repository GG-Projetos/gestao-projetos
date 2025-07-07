"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (email: string, password: string, name: string) => Promise<AuthResult>
  logout: () => Promise<void>
}

interface AuthResult {
  success: boolean
  error?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão inicial
    console.log("🔍 Verificando sessão inicial...")
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log("✅ Sessão encontrada para:", session.user.email)
        setUser(session.user)
      } else {
        console.log("❌ Nenhuma sessão encontrada")
      }
      setIsLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event)
      if (session?.user) {
        console.log("✅ Usuário logado:", session.user.email)
        setUser(session.user)
      } else {
        console.log("❌ Usuário deslogado")
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      console.log("🔄 Tentando fazer login com:", email)

      // Validar email
      const normalizedEmail = email.trim().toLowerCase()
      if (!validateEmail(normalizedEmail)) {
        console.error("❌ Email inválido:", normalizedEmail)
        return { success: false, error: "Formato de email inválido" }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password.trim(),
      })

      if (error) {
        console.error("❌ Erro no login:", error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        console.log("✅ Login realizado com sucesso:", data.user.email)
        return { success: true }
      }

      return { success: false, error: "Erro desconhecido no login" }
    } catch (error) {
      console.error("❌ Erro inesperado no login:", error)
      return { success: false, error: "Erro inesperado. Tente novamente." }
    }
  }

  const register = async (email: string, password: string, name: string): Promise<AuthResult> => {
    try {
      console.log("🔄 Tentando registrar usuário:", email, "com nome:", name)

      // Validar email
      const normalizedEmail = email.trim().toLowerCase()
      if (!validateEmail(normalizedEmail)) {
        console.error("❌ Email inválido:", normalizedEmail)
        return { success: false, error: "Formato de email inválido" }
      }

      // Validar senha
      if (password.length < 6) {
        return { success: false, error: "A senha deve ter pelo menos 6 caracteres" }
      }

      // Validar nome
      if (!name.trim()) {
        return { success: false, error: "Nome é obrigatório" }
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim(),
          },
        },
      })

      if (error) {
        console.error("❌ Erro no registro:", error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        console.log("✅ Registro realizado com sucesso:", data.user.email)

        // Criar perfil do usuário na tabela profiles
        try {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            name: name.trim(),
            email: normalizedEmail,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("⚠️ Erro ao criar perfil:", profileError)
            // Não falha o registro se o perfil não for criado
          } else {
            console.log("✅ Perfil criado com sucesso")
          }
        } catch (profileError) {
          console.error("⚠️ Erro inesperado ao criar perfil:", profileError)
        }

        return { success: true }
      }

      return { success: false, error: "Erro desconhecido no registro" }
    } catch (error) {
      console.error("❌ Erro inesperado no registro:", error)
      return { success: false, error: "Erro inesperado. Tente novamente." }
    }
  }

  const logout = async () => {
    try {
      console.log("🔄 Fazendo logout...")
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("❌ Erro no logout:", error)
        throw error
      }
      console.log("✅ Logout realizado com sucesso")
    } catch (error) {
      console.error("❌ Erro no logout:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
