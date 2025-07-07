"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthResult {
  success: boolean
  error?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (name: string, email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        console.log("🔄 Verificando sessão atual...")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ Erro ao obter sessão:", error)
        } else {
          setUser(session?.user ?? null)
          console.log("✅ Sessão atual:", session?.user?.email || "Nenhuma")
        }
      } catch (error) {
        console.error("❌ Erro ao verificar sessão:", error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Mudança de auth:", event, session?.user?.email || "Nenhum usuário")
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true)
    try {
      console.log("🔄 Tentando fazer login com:", email)

      // Validar email antes de enviar
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        console.error("❌ Email inválido:", email)
        return { success: false, error: "Formato de email inválido" }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        console.error("❌ Erro no login:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ Login realizado com sucesso:", data.user?.email)
      return { success: true }
    } catch (error) {
      console.error("❌ Erro ao fazer login:", error)
      return { success: false, error: "Erro interno no login" }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true)
    try {
      console.log("🔄 Tentando registrar usuário:", { name, email })

      // Validar email antes de enviar
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        console.error("❌ Email inválido:", email)
        return { success: false, error: "Formato de email inválido" }
      }

      // Validar senha
      if (password.length < 6) {
        console.error("❌ Senha muito curta")
        return { success: false, error: "A senha deve ter pelo menos 6 caracteres" }
      }

      // Validar nome
      if (!name || name.trim().length < 2) {
        console.error("❌ Nome inválido")
        return { success: false, error: "Nome deve ter pelo menos 2 caracteres" }
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      })

      if (error) {
        console.error("❌ Erro no registro:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ Registro realizado com sucesso:", data.user?.email)
      return { success: true }
    } catch (error) {
      console.error("❌ Erro ao registrar:", error)
      return { success: false, error: "Erro interno no registro" }
    } finally {
      setIsLoading(false)
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
      console.error("❌ Erro ao fazer logout:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
