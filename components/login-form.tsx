"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap } from "lucide-react"
import { createClient } from "@/lib/supabaseClient" // Import Supabase client
import { useAuth } from "@/app/AuthContext" // Import AuthContext
import { SupabaseConfigWarning } from "@/components/supabase-config-warning"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const { login } = useAuth() // Use the login function from AuthContext

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
                                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here'

  // Show configuration warning if Supabase is not properly configured
  if (!isSupabaseConfigured) {
    return <SupabaseConfigWarning />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Create Supabase client with error handling
      let supabase;
      try {
        supabase = createClient();
      } catch (clientError) {
        setError("Configuration error: Please contact administrator to set up Supabase connection.");
        setIsLoading(false);
        return;
      }

      let data;
      if (isRegistering) {
        // Use Supabase for sign-up
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role // Store the user role in user metadata
            }
          }
        });
        if (signUpError) throw signUpError;
        data = authData;
      } else {
        // Use Supabase for sign-in
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        data = authData;
      }
      
      if (data.user) {
        // Supabase authentication successful
        const session = data.session ?? (await supabase.auth.getSession()).data.session;
        const token = session?.access_token;
        const name = data.user.email ?? (data.user.user_metadata as any)?.name ?? "User";
        const userRole = (role || (data.user.user_metadata as any)?.role) as string | undefined;

        if (!token) {
          setError("No active session. Please verify your email and try again.");
          return;
        }
        if (!userRole) {
          setError("Role is required.");
          return;
        }

        login({
          name,
          role: userRole,
          token,
        });
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
