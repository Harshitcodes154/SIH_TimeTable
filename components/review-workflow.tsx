"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, MessageSquare, User, Calendar } from "lucide-react"

export function ReviewWorkflow() {
  const [pendingTimetables, setPendingTimetables] = useState<any[]>([])
  const [selectedTimetable, setSelectedTimetable] = useState<any>(null)
  const [reviewComment, setReviewComment] = useState("")

  const authToken = localStorage.getItem("userToken")

  const fetchPendingTimetables = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/timetables/pending", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      })
      if (!response.ok) throw new Error("Failed to fetch pending timetables")
      const data = await response.json()
      setPendingTimetables(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchPendingTimetables()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/timetables/${id}/approve`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      if (!response.ok) throw new Error("Approval failed")
      fetchPendingTimetables()
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/timetables/${id}/reject`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify({ comment: reviewComment }),
      })
      if (!response.ok) throw new Error("Rejection failed")
      fetchPendingTimetables()
    } catch (err) {
      console.error(err)
    } finally {
      setSelectedTimetable(null)
      setReviewComment("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "under-review":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "under-review":
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Review & Approval</h2>
        <p className="text-muted-foreground">Review submitted timetables and manage the approval workflow</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingTimetables.length}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable List */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Timetables</CardTitle>
          <CardDescription>Review and approve timetables submitted by department coordinators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTimetables.map((timetable) => (
              <div key={timetable.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(timetable.status)}
                    <div>
                      <h4 className="font-medium">
                        {timetable.department} - {timetable.semester}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{timetable.submittedBy}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{timetable.submittedDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(timetable.status)}>{timetable.status.replace("-", " ")}</Badge>
                    <div className="text-right text-sm">
                      <p>
                        Score: <span className="font-medium">{timetable.score}%</span>
                      </p>
                      <p className={`${timetable.conflicts === 0 ? "text-green-600" : "text-orange-600"}`}>
                        Conflicts: {timetable.conflicts}
                      </p>
                    </div>
                  </div>
                </div>

                {timetable.status === "pending" && (
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" onClick={() => setSelectedTimetable(timetable)} variant="outline">
                      Review Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(timetable.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(timetable.id)}>
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Comments */}
      {selectedTimetable && (
        <Card>
          <CardHeader>
            <CardTitle>Review Comments</CardTitle>
            <CardDescription>Add comments for the selected timetable</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Enter your review comments here..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setSelectedTimetable(null)} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => handleReject(selectedTimetable.id)}>Submit Review</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
