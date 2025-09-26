"use client"
import { createContext, useState, useEffect, useContext, ReactNode } from "react"

// Define the shape of the user data and the context
type UserType = {
  name: string
  role: string
  token: string
}

type AuthContextType = {
  isAuthenticated: boolean
  user: UserType | null
  login: (userData: UserType) => void
  logout: () => void
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)

  // Check for existing session in localStorage when the app loads
  useEffect(() => {
    try {
      const token = localStorage.getItem("userToken")
      const username = localStorage.getItem("username")
      const role = localStorage.getItem("role")
      if (token && username && role) {
        setUser({ name: username, role, token })
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, [])

  const login = (userData: UserType) => {
    localStorage.setItem("userToken", userData.token)
    localStorage.setItem("username", userData.name)
    localStorage.setItem("role", userData.role)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem("userToken")
    localStorage.removeItem("username")
    localStorage.removeItem("role")
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Create a custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}