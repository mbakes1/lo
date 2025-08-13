"use client"

import type React from "react"

import { useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileText, Shield } from "lucide-react"
import type { FormData } from "../hauler-onboarding-form"

interface BankingInfoStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors: Record<string, string>
}

const southAfricanBanks = [
  "ABSA Bank",
  "Standard Bank",
  "First National Bank (FNB)",
  "Nedbank",
  "Capitec Bank",
  "African Bank",
  "Investec Bank",
  "Discovery Bank",
  "TymeBank",
  "Bank Zero",
  "Bidvest Bank",
  "Sasfin Bank",
  "Other",
]

const accountTypes = ["Current Account", "Savings Account", "Business Current Account", "Business Savings Account"]

interface FileUploadProps {
  label: string
  required?: boolean
  file: File | null
  onFileChange: (file: File | null) => void
  error?: string
  accept?: string
  description?: string
}

function FileUpload({
  label,
  required = false,
  file,
  onFileChange,
  error,
  accept = ".pdf,.jpg,.jpeg,.png",
  description,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    onFileChange(selectedFile)
  }

  const handleRemoveFile = () => {
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <Card
        className={`border-2 border-dashed transition-colors ${error ? "border-destructive" : "border-muted-foreground/25 hover:border-muted-foreground/50"}`}
      >
        <CardContent className="p-6">
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-transparent">
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground">Drag and drop or click to upload</p>
                <p className="text-xs text-muted-foreground">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileSelect} className="hidden" />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export function BankingInfoStep({ formData, updateFormData, errors }: BankingInfoStepProps) {
  const formatAccountNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")
    // Limit to 13 digits
    return digits.slice(0, 13)
  }

  const formatBranchCode = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")
    // Limit to 6 digits
    return digits.slice(0, 6)
  }

  return (
    <div className="space-y-8">
      {/* Banking Information Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Banking Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide your banking details for payment processing. All payments will be made to this account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-sm font-medium">
              Bank Name <span className="text-primary">*</span>
            </Label>
            <Select value={formData.bankName} onValueChange={(value) => updateFormData({ bankName: value })}>
              <SelectTrigger className={errors.bankName ? "border-destructive focus-visible:ring-destructive" : ""}>
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                {southAfricanBanks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bankName && <p className="text-sm text-destructive">{errors.bankName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolderName" className="text-sm font-medium">
              Account Holder Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="accountHolderName"
              placeholder="Enter account holder name"
              value={formData.accountHolderName}
              onChange={(e) => updateFormData({ accountHolderName: e.target.value })}
              className={errors.accountHolderName ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.accountHolderName && <p className="text-sm text-destructive">{errors.accountHolderName}</p>}
            <p className="text-xs text-muted-foreground">Must match the name on your bank account</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-sm font-medium">
              Account Number <span className="text-primary">*</span>
            </Label>
            <Input
              id="accountNumber"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={(e) => updateFormData({ accountNumber: formatAccountNumber(e.target.value) })}
              className={errors.accountNumber ? "border-destructive focus-visible:ring-destructive" : ""}
              maxLength={13}
            />
            {errors.accountNumber && <p className="text-sm text-destructive">{errors.accountNumber}</p>}
            <p className="text-xs text-muted-foreground">8-13 digits, numbers only</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType" className="text-sm font-medium">
              Account Type <span className="text-primary">*</span>
            </Label>
            <Select value={formData.accountType} onValueChange={(value) => updateFormData({ accountType: value })}>
              <SelectTrigger className={errors.accountType ? "border-destructive focus-visible:ring-destructive" : ""}>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountType && <p className="text-sm text-destructive">{errors.accountType}</p>}
          </div>

          <div className="md:col-span-2">
            <div className="space-y-2">
              <Label htmlFor="branchCode" className="text-sm font-medium">
                Branch Code <span className="text-primary">*</span>
              </Label>
              <Input
                id="branchCode"
                placeholder="Enter 6-digit branch code"
                value={formData.branchCode}
                onChange={(e) => updateFormData({ branchCode: formatBranchCode(e.target.value) })}
                className={`max-w-xs ${errors.branchCode ? "border-destructive focus-visible:ring-destructive" : ""}`}
                maxLength={6}
              />
              {errors.branchCode && <p className="text-sm text-destructive">{errors.branchCode}</p>}
              <p className="text-xs text-muted-foreground">6-digit branch code from your bank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Section */}
      

      {/* Security Notice */}
      

      {/* Important Requirements */}
      <div className="bg-muted/50 border border-muted rounded-lg p-6">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Banking Requirements</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Account must be in your name or registered business name</li>
            <li>• Account must be active and in good standing</li>
            
            <li>• All banking details must match your provided documentation</li>
            <li>• International accounts are not currently supported</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
