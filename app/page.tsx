
"use client"

import { useAuth } from "@/app/AuthContext"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <>
      {isAuthenticated && user ? (
        <Dashboard user={user} onLogout={logout} />
      ) : (
        <LoginForm />
      )}
    </>
  )
}
