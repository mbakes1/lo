"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, XCircle, AlertTriangle, FileText, Loader2 } from "lucide-react"

interface StatusUpdateDialogProps {
  applicationId: string
  currentStatus: string
  applicationNumber: string
  onStatusUpdate: (newStatus: string) => void
  children: React.ReactNode
}

export function StatusUpdateDialog({
  applicationId,
  currentStatus,
  applicationNumber,
  onStatusUpdate,
  children,
}: StatusUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      description: "Application is waiting for initial review",
      icon: Clock,
      color: "text-gray-600",
    },
    {
      value: "under_review",
      label: "Under Review",
      description: "Application is currently being reviewed",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      value: "approved",
      label: "Approved",
      description: "Application has been approved",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      value: "rejected",
      label: "Rejected",
      description: "Application has been rejected",
      icon: XCircle,
      color: "text-red-600",
    },
    {
      value: "requires_documents",
      label: "Requires Documents",
      description: "Additional documents are needed",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      under_review: { label: "Under Review", variant: "default" as const },
      approved: { label: "Approved", variant: "default" as const, className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", variant: "destructive" as const },
      requires_documents: {
        label: "Requires Documents",
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

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      setOpen(false)
      return
    }

    setIsUpdating(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update status")
      }

      const data = await response.json()
      onStatusUpdate(selectedStatus)
      setOpen(false)
      setNotes("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedStatus(currentStatus)
      setNotes("")
      setError("")
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogDescription>Update the status for application {applicationNumber}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div>
            <Label className="text-sm font-medium">Current Status</Label>
            <div className="mt-2">{getStatusBadge(currentStatus)}</div>
          </div>

          {/* New Status Selection */}
          <div className="space-y-3">
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={isUpdating || selectedStatus === currentStatus}
            className="min-w-24"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
