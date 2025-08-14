"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FormData } from "../hauler-onboarding-form"

interface DocumentUploadStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors: Record<string, string>
}

export interface DocumentInfo {
  id: string
  file: File
  type: string
  name: string
  size: number
}

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

export function DocumentUploadStep({ formData, updateFormData, errors }: DocumentUploadStepProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState("")

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    if (!selectedDocType) {
      alert("Please select a document type first")
      return
    }

    const newDocuments: DocumentInfo[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"]

      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format. Please upload PDF, JPEG, PNG, or WebP files.`)
        continue
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum file size is 10MB.`)
        continue
      }

      const docInfo: DocumentInfo = {
        id: `doc-${Date.now()}-${i}`,
        file,
        type: selectedDocType,
        name: file.name,
        size: file.size,
      }

      newDocuments.push(docInfo)
    }

    if (newDocuments.length > 0) {
      const updatedDocuments = [...(formData.documents || []), ...newDocuments]
      updateFormData({ documents: updatedDocuments })
      setSelectedDocType("") // Reset selection after upload
    }
  }

  const removeDocument = (docId: string) => {
    const updatedDocuments = (formData.documents || []).filter((doc) => doc.id !== docId)
    updateFormData({ documents: updatedDocuments })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find((dt) => dt.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Upload Supporting Documents</h3>
        <p className="text-sm text-muted-foreground">
          Please upload all relevant documents for your hauler application. At least one document is required.
        </p>
      </div>

      {errors.documents && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.documents}</AlertDescription>
        </Alert>
      )}

      {/* Document Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="document-type">Select Document Type</Label>
        <Select value={selectedDocType} onValueChange={setSelectedDocType}>
          <SelectTrigger>
            <SelectValue placeholder="Choose document type before uploading" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : selectedDocType
              ? "border-muted-foreground/25 hover:border-primary/50"
              : "border-muted-foreground/25 bg-muted/20"
        } ${!selectedDocType ? "cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (selectedDocType) {
            document.getElementById("file-upload")?.click()
          }
        }}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInput}
          className="hidden"
          disabled={!selectedDocType}
        />

        <Upload
          className={`mx-auto h-12 w-12 mb-4 ${selectedDocType ? "text-muted-foreground" : "text-muted-foreground/50"}`}
        />

        <div className="space-y-2">
          <p className={`text-sm font-medium ${selectedDocType ? "text-foreground" : "text-muted-foreground/50"}`}>
            {selectedDocType ? "Drop files here or click to browse" : "Select document type first"}
          </p>
          <p className={`text-xs ${selectedDocType ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
            Supports PDF, JPEG, PNG, WebP (max 10MB per file)
          </p>
        </div>
      </div>

      {/* Uploaded Documents List */}
      {formData.documents && formData.documents.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploaded Documents ({formData.documents.length})</h4>
          <div className="space-y-3">
            {formData.documents.map((doc) => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{getDocumentTypeLabel(doc.type)}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.size)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(doc.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <Card className="bg-muted/30 border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Document Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Upload clear, legible copies of all relevant documents</p>
          <p>• Ensure all text and details are clearly visible</p>
          <p>• Documents should be current and valid</p>
          <p>• Multiple files can be uploaded for each document type</p>
          <p>• At least one document must be uploaded to proceed</p>
        </CardContent>
      </Card>
    </div>
  )
}
