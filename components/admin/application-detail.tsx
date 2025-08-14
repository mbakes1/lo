"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusUpdateDialog } from "./status-update-dialog"
import {
  ArrowLeft,
  User,
  Building2,
  Truck,
  CreditCard,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Loader2,
  RefreshCw,
} from "lucide-react"

interface ApplicationDetails {
  application: {
    id: string
    application_number: string
    full_name: string
    id_number: string
    entity_type: "individual" | "business"
    business_name?: string
    beee_level?: string
    cipc_registration?: string
    mobile_number: string
    email: string
    physical_address: string
    province: string
    bank_name: string
    account_holder_name: string
    account_number: string
    account_type: string
    branch_code: string
    accept_terms: boolean
    consent_to_store: boolean
    consent_to_contact: boolean
    status: "pending" | "under_review" | "approved" | "rejected" | "requires_documents"
    created_at: string
    updated_at: string
  }
  trucks: Array<{
    id: string
    truck_number: number
    vehicle_type: string
    load_capacity: string
    horse_registration: string
    trailer1_registration?: string
    trailer2_registration?: string
  }>
  documents: Array<{
    id: string
    document_type: string
    file_name: string
    file_size: number
    created_at: string
  }>
}

interface ApplicationDetailProps {
  applicationId: string
  onBack: () => void
}

export function ApplicationDetail({ applicationId, onBack }: ApplicationDetailProps) {
  const [details, setDetails] = useState<ApplicationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const fetchApplicationDetails = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch application details")
      }

      const data = await response.json()
      setDetails(data)
    } catch (err) {
      setError("Failed to load application details. Please try again.")
      console.error("Error fetching application details:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplicationDetails()
  }, [applicationId])

  const handleStatusUpdate = (newStatus: string) => {
    if (details) {
      setDetails({
        ...details,
        application: {
          ...details.application,
          status: newStatus as any,
          updated_at: new Date().toISOString(),
        },
      })
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getDocumentTypeLabel = (type: string) => {
    const documentTypes = [
      { value: "vehicle_registration", label: "Vehicle Registration Certificate" },
      { value: "drivers_license", label: "Driver's License" },
      { value: "vehicle_insurance", label: "Vehicle Insurance Certificate" },
      { value: "roadworthy_certificate", label: "Roadworthy Certificate" },
      { value: "bank_statement", label: "Bank Statement" },
      { value: "bank_confirmation", label: "Bank Account Confirmation Letter" },
      { value: "id_document", label: "ID Document / Passport" },
      { value: "business_registration", label: "Business Registration (CIPC)" },
      { value: "tax_clearance", label: "Tax Clearance Certificate" },
      { value: "other", label: "Other Supporting Document" },
    ]
    return documentTypes.find((dt) => dt.value === type)?.label || type
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error || !details) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Application not found"}</p>
            <div className="flex gap-2">
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
              <Button onClick={fetchApplicationDetails} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { application, trucks, documents } = details

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{application.application_number}</h2>
            <p className="text-muted-foreground">
              {application.entity_type === "business" && application.business_name
                ? application.business_name
                : application.full_name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(application.status)}
          <StatusUpdateDialog
            applicationId={application.id}
            currentStatus={application.status}
            applicationNumber={application.application_number}
            onStatusUpdate={handleStatusUpdate}
          >
            <Button variant="outline" size="sm">
              Update Status
            </Button>
          </StatusUpdateDialog>
        </div>
      </div>

      {/* Application Details */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles ({trucks.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {application.entity_type === "business" ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="font-medium">{application.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID/Passport</p>
                    <p className="font-medium">{application.id_number}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
                  <Badge variant="outline" className="mt-1">
                    {application.entity_type === "business" ? "Business" : "Individual"}
                  </Badge>
                </div>

                {application.entity_type === "business" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                      <p className="font-medium">{application.business_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">BEEE Level</p>
                        <p className="font-medium">{application.beee_level}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">CIPC Registration</p>
                        <p className="font-medium">{application.cipc_registration}</p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{application.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{application.mobile_number}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{application.physical_address}</p>
                      <p className="text-sm text-muted-foreground">{application.province}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{application.bank_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Holder</p>
                  <p className="font-medium">{application.account_holder_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                    <p className="font-medium font-mono">{application.account_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Branch Code</p>
                    <p className="font-medium font-mono">{application.branch_code}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                  <p className="font-medium">{application.account_type}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consent Information */}
          <Card>
            <CardHeader>
              <CardTitle>Consent & Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${application.accept_terms ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-sm">Terms of Use Accepted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${application.consent_to_store ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="text-sm">Data Storage Consent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${application.consent_to_contact ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="text-sm">Contact Consent</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <div className="grid gap-6">
            {trucks.map((truck) => (
              <Card key={truck.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Truck {truck.truck_number}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vehicle Type</p>
                      <p className="font-medium">{truck.vehicle_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Load Capacity</p>
                      <p className="font-medium">{truck.load_capacity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Horse Registration</p>
                      <p className="font-medium font-mono">{truck.horse_registration}</p>
                    </div>
                    {truck.trailer1_registration && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Trailer 1 Registration</p>
                        <p className="font-medium font-mono">{truck.trailer1_registration}</p>
                      </div>
                    )}
                    {truck.trailer2_registration && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Trailer 2 Registration</p>
                        <p className="font-medium font-mono">{truck.trailer2_registration}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Uploaded Documents
              </CardTitle>
              <CardDescription>{documents.length} document(s) uploaded</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{getDocumentTypeLabel(document.document_type)}</p>
                          <p className="text-sm text-muted-foreground">
                            {document.file_name} • {formatFileSize(document.file_size)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{formatDate(document.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Application History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Application Submitted</p>
                    <p className="text-sm text-muted-foreground">{formatDate(application.created_at)}</p>
                  </div>
                </div>
                {application.updated_at !== application.created_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2" />
                    <div>
                      <p className="font-medium">Status Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDate(application.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
