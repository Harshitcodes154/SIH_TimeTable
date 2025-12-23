"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap } from "lucide-react"
import { useAuth } from "@/app/AuthContext" // Import AuthContext
// Firebase Auth + Firestore
import { auth, db } from "@/lib/firebaseClient"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getIdToken } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const { login } = useAuth() // Use the login function from AuthContext

  // (Firebase) Optional: you can check for Firebase config here if desired

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
            // Use Firebase Auth for register / sign-in
            if (isRegistering) {
              // Create user
              const userCredential = await createUserWithEmailAndPassword(auth, email, password)
              const user = userCredential.user

              // Save role and profile to Firestore users collection
              await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role,
                name: user.email,
                createdAt: new Date().toISOString(),
              })

              const token = await getIdToken(user)
              login({ name: user.email ?? "User", role, token })
            } else {
              // Sign in existing user
              const userCredential = await signInWithEmailAndPassword(auth, email, password)
              const user = userCredential.user

              // Read role from Firestore
              const userDoc = await getDoc(doc(db, "users", user.uid))
              const userData = userDoc.exists() ? (userDoc.data() as any) : null
              const userRole = (role || userData?.role) as string | undefined

              if (!userRole) {
                setError("Role is required. Please contact an administrator to assign a role.")
                return
              }

              const token = await getIdToken(user)
              login({ name: user.email ?? "User", role: userRole, token })
            }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{isRegistering ? "Register" : "Timetable Optimizer"}</CardTitle>
          <CardDescription>{isRegistering ? "Create your new account" : "Sign in to access the college timetable management system"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email" // Changed from text to email for better validation
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="faculty">Faculty Member</SelectItem>
                  <SelectItem value="coordinator">Academic Coordinator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (isRegistering ? "Registering..." : "Signing in...") : (isRegistering ? "Create Account" : "Sign In")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}
            <Button variant="link" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Sign in here" : "Register here"}
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
