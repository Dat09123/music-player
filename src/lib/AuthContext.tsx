"use client"

import { createContext, useContext, type ReactNode } from "react"

interface AuthContextType {
  user: null
  accessToken: null
  isLoading: boolean
  isAuthenticated: boolean
  authError: null
  login: () => Promise<void>
  logout: () => void
  getToken: () => Promise<null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
        authError: null,
        login: async () => {},
        logout: () => {},
        getToken: async () => null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
