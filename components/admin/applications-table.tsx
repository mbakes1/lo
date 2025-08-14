"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdvancedFilters } from "./advanced-filters"
import { Search, Download, Eye, ChevronLeft, ChevronRight, Loader2, RefreshCw, ArrowUpDown } from "lucide-react"

interface Application {
  id: string
  application_number: string
  full_name: string
  email: string
  entity_type: "individual" | "business"
  business_name?: string
  status: "pending" | "under_review" | "approved" | "rejected" | "requires_documents"
  created_at: string
  truck_count: number
  document_count: number
}

interface ApplicationsTableProps {
  onViewApplication: (applicationId: string) => void
}

export function ApplicationsTable({ onViewApplication }: ApplicationsTableProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [exporting, setExporting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    entityType: "all",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    minTrucks: "",
    maxTrucks: "",
    hasDocuments: "all",
  })

  const [searchDebounce, setSearchDebounce] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchDebounce }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchDebounce])

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sort: sortBy,
        order: sortOrder,
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.entityType !== "all" && { entity_type: filters.entityType }),
        ...(filters.dateFrom && { date_from: filters.dateFrom.toISOString() }),
        ...(filters.dateTo && { date_to: filters.dateTo.toISOString() }),
        ...(filters.minTrucks && { min_trucks: filters.minTrucks }),
        ...(filters.maxTrucks && { max_trucks: filters.maxTrucks }),
        ...(filters.hasDocuments !== "all" && { has_documents: filters.hasDocuments }),
      })

      const response = await fetch(`/api/admin/applications?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch applications")
      }

      const data = await response.json()
      setApplications(data.applications)
      setPagination(data.pagination)
    } catch (err) {
      setError("Failed to load applications. Please try again.")
      console.error("Error fetching applications:", err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, sortBy, sortOrder, filters])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        export: "true",
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.entityType !== "all" && { entity_type: filters.entityType }),
        ...(filters.dateFrom && { date_from: filters.dateFrom.toISOString() }),
        ...(filters.dateTo && { date_to: filters.dateTo.toISOString() }),
        ...(filters.minTrucks && { min_trucks: filters.minTrucks }),
        ...(filters.maxTrucks && { max_trucks: filters.maxTrucks }),
        ...(filters.hasDocuments !== "all" && { has_documents: filters.hasDocuments }),
      })

      const response = await fetch(`/api/admin/applications/export?${params}`)
      if (!response.ok) {
        throw new Error("Failed to export applications")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `hauler-applications-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      entityType: "all",
      dateFrom: undefined,
      dateTo: undefined,
      minTrucks: "",
      maxTrucks: "",
      hasDocuments: "all",
    })
    setSearchDebounce("")
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      under_review: { label: "Under Review", variant: "default" as const },
      approved: { label: "Approved", variant: "default" as const, className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", variant: "destructive" as const },
      requires_documents: {
        label: "Needs Documents",
        variant: "default" as const,
        className: "bg-orange-100 text-orange-800",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchApplications} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>All Applications</CardTitle>
            <CardDescription>
              {pagination.total} total applications • Page {pagination.page} of {pagination.pages}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchDebounce}
                onChange={(e) => setSearchDebounce(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="requires_documents">Needs Documents</SelectItem>
              </SelectContent>
            </Select>
            <AdvancedFilters filters={filters} onFiltersChange={setFilters} onClearFilters={handleClearFilters} />
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No applications found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSort("application_number")}
                      >
                        Application #
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSort("full_name")}
                      >
                        Applicant
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Trucks</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSort("created_at")}
                      >
                        Submitted
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.application_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {application.entity_type === "business" && application.business_name
                              ? application.business_name
                              : application.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{application.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {application.entity_type === "business" ? "Business" : "Individual"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{application.truck_count} truck(s)</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{application.document_count} document(s)</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{formatDate(application.created_at)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => onViewApplication(application.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
