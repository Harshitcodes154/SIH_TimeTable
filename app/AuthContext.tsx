"use client"
import { createContext, useState, useEffect, useContext, ReactNode } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

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
    // Listen to Firebase auth state changes to keep the context in sync
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const token = await fbUser.getIdToken()
          // Try to read role/name from Firestore users collection
          let name = fbUser.email ?? "User"
          let role = localStorage.getItem("role") || ""
          try {
            const userDoc = await getDoc(doc(db, "users", fbUser.uid))
            if (userDoc.exists()) {
              const data = userDoc.data() as any
              role = data.role ?? role
              name = data.name ?? name
            }
          } catch (e) {
            console.warn("Could not read user profile from Firestore:", e)
          }

          localStorage.setItem("userToken", token)
          localStorage.setItem("username", name)
          localStorage.setItem("role", role)
          setUser({ name, role, token })
          setIsAuthenticated(true)
        } else {
          // Not logged in
          localStorage.removeItem("userToken")
          localStorage.removeItem("username")
          localStorage.removeItem("role")
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error("Auth state handling error:", err)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = (userData: UserType) => {
    localStorage.setItem("userToken", userData.token)
    localStorage.setItem("username", userData.name)
    localStorage.setItem("role", userData.role)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    // Sign out from Firebase as well
    try {
      firebaseSignOut(auth).catch(() => {})
    } finally {
      localStorage.removeItem("userToken")
      localStorage.removeItem("username")
      localStorage.removeItem("role")
      setUser(null)
      setIsAuthenticated(false)
    }
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