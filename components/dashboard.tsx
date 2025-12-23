"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { ConfigWarning } from "./config-warning"
import { firebaseConfig } from "@/lib/firebaseClient"

type UserType = {
  name: string
  role: string
  token: string
}

type DashboardProps = {
  user: UserType
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'parameters' | 'timetable' | 'review'>('parameters')
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true)

  useEffect(() => {
    // Check if Firebase config is present (used as DB/auth backend)
    const configured = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    )
    setIsSupabaseConfigured(configured)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Class Scheduling Platform</h1>
            <p className="text-muted-foreground">Welcome, {user.name} ({user.role})</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>
      
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('parameters')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'parameters'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              Parameters
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'timetable'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              Generate Timetable
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'review'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              Review
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {!isSupabaseConfigured && (
          <div className="mb-8">
            <ConfigWarning />
          </div>
        )}
        
        {activeTab === 'parameters' && <ParameterFormComponent />}
        {activeTab === 'timetable' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Timetable Generation</h2>
            <p className="text-muted-foreground mb-8">Configure parameters first, then generate your timetable.</p>
            <Button size="lg" disabled={!isSupabaseConfigured}>
              {isSupabaseConfigured ? 'Generate New Timetable' : 'Database Required'}
            </Button>
          </div>
        )}
        {activeTab === 'review' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Review Generated Timetables</h2>
            <p className="text-muted-foreground">
              {isSupabaseConfigured 
                ? 'View and manage your generated timetables here.'
                : 'Configure database connection to view saved timetables.'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function ParameterFormComponent() {
  const [subjects, setSubjects] = useState<string[]>([])
  const [newSubject, setNewSubject] = useState("")
  const [parameters, setParameters] = useState({
    classrooms: "",
    batches: "",
    maxClassesPerDay: "",
    semester: "",
    department: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setParameters({ ...parameters, [name]: value })
  }

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()])
      setNewSubject("")
    }
  }

  const removeSubject = (subjectToRemove: string) => {
    // The parameter 's' now has an explicit type 'string'
    setSubjects(subjects.filter((s: string) => s !== subjectToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    // Validate required fields
    if (!parameters.department.trim()) {
      setError("Department is required")
      return
    }
    if (!parameters.semester.trim()) {
      setError("Semester is required")
      return
    }
    if (!parameters.classrooms.trim() || parseInt(parameters.classrooms) <= 0) {
      setError("Please enter a valid number of classrooms")
      return
    }
    if (!parameters.batches.trim() || parseInt(parameters.batches) <= 0) {
      setError("Please enter a valid number of batches")
      return
    }
    if (!parameters.maxClassesPerDay.trim() || parseInt(parameters.maxClassesPerDay) <= 0) {
      setError("Please enter a valid maximum classes per day")
      return
    }
    if (subjects.length === 0) {
      setError("Please add at least one subject")
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/parameters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if required
          // 'Authorization': `Bearer ${your_auth_token}`
        },
        body: JSON.stringify({ ...parameters, subjects }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit parameters');
      }

      const result = await response.json();
      setMessage('Parameters submitted successfully!');
      console.log("Server response:", result);

    } catch (err: any) {
      setError(err.message);
    }
    console.log("Parameters submitted:", { ...parameters, subjects })
    setMessage("Parameters submitted successfully (logged to console).")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Scheduling Parameters</h2>
        <p className="text-muted-foreground">Set the parameters for generating the class schedule.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Parameters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" value={parameters.department} onChange={handleInputChange} placeholder="e.g., Computer Science" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input id="semester" name="semester" value={parameters.semester} onChange={handleInputChange} placeholder="e.g., 5th" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classrooms">Number of Classrooms</Label>
              <Input id="classrooms" name="classrooms" type="number" value={parameters.classrooms} onChange={handleInputChange} placeholder="e.g., 10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batches">Number of Batches</Label>
              <Input id="batches" name="batches" type="number" value={parameters.batches} onChange={handleInputChange} placeholder="e.g., 4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxClassesPerDay">Max Classes per Day</Label>
              <Input id="maxClassesPerDay" name="maxClassesPerDay" type="number" value={parameters.maxClassesPerDay} onChange={handleInputChange} placeholder="e.g., 6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add a new subject"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
              />
              <Button type="button" onClick={addSubject}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <div key={subject} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  {subject}
                  <button type="button" onClick={() => removeSubject(subject)} className="rounded-full hover:bg-destructive/80">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Generate Schedule</Button>
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}