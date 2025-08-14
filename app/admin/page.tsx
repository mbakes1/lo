"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, LogOut, Users, Clock, CheckCircle, XCircle, FileText } from "lucide-react"
import { PasswordDialog } from "@/components/admin/password-dialog"
import { ApplicationsTable } from "@/components/admin/applications-table"
import { ApplicationDetail } from "@/components/admin/application-detail"

interface DashboardStats {
  totalApplications: number
  pendingReview: number
  approved: number
  rejected: number
  requiresDocuments: number
}

interface RecentApplication {
  id: number
  application_number: string
  full_name: string
  email: string
  status: string
  created_at: string
}

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)

  // Dashboard data
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    requiresDocuments: 0,
  })
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = sessionStorage.getItem("admin_authenticated")
      if (authenticated === "true") {
        setIsAuthenticated(true)
        fetchDashboardData()
      } else {
        setShowPasswordDialog(true)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const fetchDashboardData = async () => {
    setDataLoading(true)
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch("/api/admin/dashboard/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent applications
      const recentResponse = await fetch("/api/admin/dashboard/recent")
      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        setRecentApplications(recentData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
    setShowPasswordDialog(false)
    fetchDashboardData()
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated")
    setIsAuthenticated(false)
    setShowPasswordDialog(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      case "under_review":
        return "secondary"
      case "requires_documents":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (!isAuthenticated) {
    return <PasswordDialog open={showPasswordDialog} onAuthenticated={handleAuthenticated} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading admin portal...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Hauler Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                Admin Access
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedApplication ? (
          <div>
            <Button variant="outline" onClick={() => setSelectedApplication(null)} className="mb-6">
              ← Back to Dashboard
            </Button>
            <ApplicationDetail applicationId={selectedApplication} />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">All Applications</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dataLoading ? "..." : stats.totalApplications}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dataLoading ? "..." : stats.pendingReview}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approved</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dataLoading ? "..." : stats.approved}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dataLoading ? "..." : stats.rejected}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Needs Documents</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dataLoading ? "..." : stats.requiresDocuments}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Latest hauler applications submitted</CardDescription>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : recentApplications.length > 0 ? (
                    <div className="space-y-4">
                      {recentApplications.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedApplication(app.application_number)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-medium">{app.full_name}</p>
                                <p className="text-sm text-gray-500">{app.application_number}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">{app.email}</p>
                                <p className="text-xs text-gray-400">{new Date(app.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(app.status)}>{formatStatus(app.status)}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No applications found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <ApplicationsTable onViewApplication={setSelectedApplication} />
            </TabsContent>

            <TabsContent value="pending">
              <ApplicationsTable onViewApplication={setSelectedApplication} defaultStatusFilter="pending" />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
