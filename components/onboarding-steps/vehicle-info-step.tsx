"use client"

import type React from "react"
import { useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, FileText, Plus, Minus, Truck } from "lucide-react"
import type { FormData } from "../hauler-onboarding-form"

interface VehicleInfoStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors: Record<string, string>
}

const vehicleTypes = [
  "Bakkie/Light Delivery Vehicle",
  "Panel Van",
  "Truck (Rigid)",
  "Truck (Articulated)",
  "Flatbed Truck",
  "Refrigerated Truck",
  "Tipper Truck",
  "Other",
]

const loadCapacities = [
  "1 Ton",
  "2 Tons",
  "3 Tons",
  "4 Tons",
  "5 Tons",
  "6 Tons",
  "7 Tons",
  "8 Tons",
  "9 Tons",
  "10 Tons",
  "11 Tons",
  "12 Tons",
  "13 Tons",
  "14 Tons",
  "15 Tons",
]

interface MultiFileUploadProps {
  label: string
  files: File[]
  onFilesChange: (files: File[]) => void
  error?: string
  accept?: string
  description?: string
}

function MultiFileUpload({
  label,
  files,
  onFilesChange,
  error,
  accept = ".pdf,.jpg,.jpeg,.png",
  description,
}: MultiFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    onFilesChange([...files, ...selectedFiles])
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {label} <span className="text-primary">*</span>
        </Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      {/* File Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${error ? "border-destructive" : "border-muted-foreground/25 hover:border-muted-foreground/50"}`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="text-center">
            <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="bg-transparent h-10 sm:h-9"
              >
                Add Files
              </Button>
              <p className="text-xs text-muted-foreground">Drag and drop or click to upload multiple files</p>
              <p className="text-xs text-muted-foreground">Supported formats: PDF, JPG, PNG (Max 10MB each)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <input ref={fileInputRef} type="file" accept={accept} multiple onChange={handleFileSelect} className="hidden" />

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Files ({files.length})</Label>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export function VehicleInfoStep({ formData, updateFormData, errors }: VehicleInfoStepProps) {
  const addTruck = () => {
    const newTruck = {
      id: `truck-${Date.now()}`,
      vehicleType: "",
      loadCapacity: "",
      horseRegistration: "",
      trailer1Registration: "",
      trailer2Registration: "",
    }
    updateFormData({ trucks: [...formData.trucks, newTruck] })
  }

  const removeTruck = (truckId: string) => {
    if (formData.trucks.length > 1) {
      updateFormData({ trucks: formData.trucks.filter((truck) => truck.id !== truckId) })
    }
  }

  const updateTruck = (truckId: string, updates: Partial<(typeof formData.trucks)[0]>) => {
    const updatedTrucks = formData.trucks.map((truck) => (truck.id === truckId ? { ...truck, ...updates } : truck))
    updateFormData({ trucks: updatedTrucks })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Trucks Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Vehicle Details</h3>
            <p className="text-sm text-muted-foreground">
              Add details for each truck in your fleet. All vehicles must have a capacity between 1 and 15 tons.
            </p>
          </div>
          <Button
            onClick={addTruck}
            variant="outline"
            className="flex items-center gap-2 bg-transparent h-10 sm:h-9 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Add Truck
          </Button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {formData.trucks.map((truck, index) => (
            <Card key={truck.id} className="border-2">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Truck {index + 1}
                  </CardTitle>
                  {formData.trucks.length > 1 && (
                    <Button
                      onClick={() => removeTruck(truck.id)}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor={`vehicleType-${truck.id}`} className="text-sm font-medium">
                      Vehicle Type <span className="text-primary">*</span>
                    </Label>
                    <Select
                      value={truck.vehicleType}
                      onValueChange={(value) => updateTruck(truck.id, { vehicleType: value })}
                    >
                      <SelectTrigger
                        className={`h-11 ${
                          errors[`truck-${index}-vehicleType`]
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`truck-${index}-vehicleType`] && (
                      <p className="text-sm text-destructive">{errors[`truck-${index}-vehicleType`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`loadCapacity-${truck.id}`} className="text-sm font-medium">
                      Load Capacity <span className="text-primary">*</span>
                    </Label>
                    <Select
                      value={truck.loadCapacity}
                      onValueChange={(value) => updateTruck(truck.id, { loadCapacity: value })}
                    >
                      <SelectTrigger
                        className={`h-11 ${
                          errors[`truck-${index}-loadCapacity`]
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select load capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadCapacities.map((capacity) => (
                          <SelectItem key={capacity} value={capacity}>
                            {capacity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`truck-${index}-loadCapacity`] && (
                      <p className="text-sm text-destructive">{errors[`truck-${index}-loadCapacity`]}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Vehicle capacity must be between 1 and 15 tons</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Registration Numbers</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`horseRegistration-${truck.id}`} className="text-sm font-medium">
                        Horse Registration <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id={`horseRegistration-${truck.id}`}
                        placeholder="e.g., ABC 123 GP"
                        value={truck.horseRegistration}
                        onChange={(e) => updateTruck(truck.id, { horseRegistration: e.target.value.toUpperCase() })}
                        className={`h-11 ${
                          errors[`truck-${index}-horseRegistration`]
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                      />
                      {errors[`truck-${index}-horseRegistration`] && (
                        <p className="text-sm text-destructive">{errors[`truck-${index}-horseRegistration`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`trailer1Registration-${truck.id}`} className="text-sm font-medium">
                        Trailer 1 Registration
                      </Label>
                      <Input
                        id={`trailer1Registration-${truck.id}`}
                        placeholder="e.g., DEF 456 GP"
                        value={truck.trailer1Registration}
                        onChange={(e) => updateTruck(truck.id, { trailer1Registration: e.target.value.toUpperCase() })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <Label htmlFor={`trailer2Registration-${truck.id}`} className="text-sm font-medium">
                        Trailer 2 Registration
                      </Label>
                      <Input
                        id={`trailer2Registration-${truck.id}`}
                        placeholder="e.g., GHI 789 GP"
                        value={truck.trailer2Registration}
                        onChange={(e) => updateTruck(truck.id, { trailer2Registration: e.target.value.toUpperCase() })}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Horse registration is required. Trailer registrations are optional but recommended if applicable.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Vehicle Documents</h3>
          <p className="text-sm text-muted-foreground">
            Upload all required documents for your vehicles. We will manually review and match documents to the
            appropriate trucks.
          </p>
        </div>

        <MultiFileUpload
          label="Vehicle Documents"
          files={formData.vehicleDocuments}
          onFilesChange={(files) => updateFormData({ vehicleDocuments: files })}
          error={errors.vehicleDocuments}
          description="Upload all vehicle documents including proof of ownership, roadworthy certificates, insurance certificates, and vehicle photos for all trucks"
        />

        <div className="bg-muted/50 border border-muted rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Required Documents per Truck:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Proof of ownership (registration certificate)</li>
            <li>• Roadworthy certificate (not older than 60 days)</li>
            <li>• Insurance certificate (comprehensive and current)</li>
            <li>• Vehicle photo (optional but recommended)</li>
          </ul>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-muted/50 border border-muted rounded-lg p-4 sm:p-6">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-sm sm:text-base">Important Requirements</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Vehicle capacity must be between 1 and 15 tons</li>
            <li>• All documents must be current and valid</li>
            <li>• Roadworthy certificate must not be older than 60 days</li>
            <li>• Insurance must be comprehensive and current</li>
            <li>• Vehicles must be registered in your name or business name</li>
            <li>• We will manually review and match documents to trucks during processing</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
