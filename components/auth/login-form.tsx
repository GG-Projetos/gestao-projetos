"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function LoginForm() {
  const { login, register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados para login
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Estados para registro
  const [registerNome, setRegisterNome] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Função para validar email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validações
    if (!loginNome.trim()) {
      setError("Nome é obrigatório")
      return
    }
    if (!loginEmail.trim()) {
      setError("Email é obrigatório")
      return
    }

    if (!isValidEmail(loginEmail.trim())) {
      setError("Email inválido")
      return
    }

    if (!loginPassword.trim()) {
      setError("Senha é obrigatória")
      return
    }

    setIsLoading(true)

    try {
      console.log("🔄 Iniciando login...")
      const result = await login(loginEmail, loginPassword)

      if (result.success) {
        console.log("✅ Login bem-sucedido")
        setSuccess("Login realizado com sucesso!")
        // Limpar formulário
        setLoginNome("")
        setLoginEmail("")
        setLoginPassword("")
      } else {
        console.error("❌ Erro no login:", result.error)
        setError(result.error || "Erro no login")
      }
    } catch (error) {
      console.error("❌ Erro inesperado no login:", error)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validações
    if (!registerEmail.trim()) {
      setError("Email é obrigatório")
      return
    }

    if (!registerEmail.trim()) {
      setError("Email é obrigatório")
      return
    }

    if (!isValidEmail(registerEmail.trim())) {
      setError("Email inválido")
      return
    }

    if (!registerPassword.trim()) {
      setError("Senha é obrigatória")
      return
    }

    if (registerPassword.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres")
      return
    }

    if (registerPassword !== confirmPassword) {
      setError("Senhas não coincidem")
      return
    }

    setIsLoading(true)

    try {
      console.log("🔄 Iniciando registro...")
      const result = await register(registerEmail, registerPassword)

      if (result.success) {
        console.log("✅ Registro bem-sucedido")
        setSuccess("Conta criada com sucesso!")
        // Limpar formulário
        setRegisterNome("")
        setRegisterEmail("")
        setRegisterPassword("")
        setConfirmPassword("")
      } else {
        console.error("❌ Erro no registro:", result.error)
        setError(result.error || "Erro no registro")
      }
    } catch (error) {
      console.error("❌ Erro inesperado no registro:", error)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">TaskFlow</CardTitle>
          <CardDescription>Sistema de Gestão Colaborativa</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registrar</TabsTrigger>
            </TabsList>

            {/* Mensagens de erro e sucesso */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Tab de Login */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Sua senha"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Tab de Registro */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">

              <div className="space-y-2">
                  <Label htmlFor="register-name">Nome</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-nome"
                      type="nome"
                      placeholder="Nome completo"
                      value={registerNome}
                      onChange={(e) => setRegisterNome(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
