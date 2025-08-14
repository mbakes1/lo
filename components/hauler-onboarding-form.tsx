"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, ArrowLeft, ArrowRight, AlertTriangle, Save, RotateCcw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BasicInfoStep } from "./onboarding-steps/basic-info-step"
import { VehicleInfoStep } from "./onboarding-steps/vehicle-info-step"
import { BankingInfoStep } from "./onboarding-steps/banking-info-step"
import { TermsConsentStep } from "./onboarding-steps/terms-consent-step"
import { ConfirmationStep } from "./onboarding-steps/confirmation-step"
import { DocumentUploadStep, type DocumentInfo } from "./onboarding-steps/document-upload-step"
import emailjs from "emailjs-com"

export interface FormData {
  // Basic Info
  fullName: string
  idNumber: string
  entityType: "individual" | "business" | ""
  businessName: string
  beeLevel: string
  cipcRegistration: string
  mobileNumber: string
  email: string
  physicalAddress: string
  province: string

  // Vehicle Info
  trucks: Array<{
    id: string
    vehicleType: string
    loadCapacity: string
    horseRegistration: string
    trailer1Registration: string
    trailer2Registration: string
  }>

  // Banking Info
  bankName: string
  accountHolderName: string
  accountNumber: string
  accountType: string
  branchCode: string

  // Terms & Consent
  acceptTerms: boolean
  consentToStore: boolean
  consentToContact: boolean

  // Document Info
  documents: DocumentInfo[]

  // Additional fields for confirmation
  applicationNumber?: string
}

const steps = [
  { id: 1, title: "Basic Information", description: "Personal and contact details" },
  { id: 2, title: "Vehicle Information", description: "Truck details and registration" },
  { id: 3, title: "Banking Details", description: "Payment and account information" },
  { id: 4, title: "Document Upload", description: "Supporting documents" },
  { id: 5, title: "Terms & Consent", description: "Agreement and permissions" },
  { id: 6, title: "Confirmation", description: "Review and submit" },
]

export function HaulerOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    idNumber: "",
    entityType: "",
    businessName: "",
    beeLevel: "",
    cipcRegistration: "",
    mobileNumber: "",
    email: "",
    physicalAddress: "",
    province: "",
    trucks: [
      {
        id: "truck-1",
        vehicleType: "",
        loadCapacity: "",
        horseRegistration: "",
        trailer1Registration: "",
        trailer2Registration: "",
      },
    ],
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    accountType: "",
    branchCode: "",
    acceptTerms: false,
    consentToStore: false,
    consentToContact: false,
    documents: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [hasRestoredData, setHasRestoredData] = useState(false)
  const [showRestorePrompt, setShowRestorePrompt] = useState(false)

  useEffect(() => {
    if (hasRestoredData) {
      setIsAutoSaving(true)
      const timeoutId = setTimeout(() => {
        try {
          const dataToSave = {
            formData,
            currentStep,
            timestamp: new Date().toISOString(),
          }
          localStorage.setItem("hauler-onboarding-draft", JSON.stringify(dataToSave))
        } catch (error) {
          console.error("Failed to save draft:", error)
        }
        setIsAutoSaving(false)
      }, 1000) // Debounce saves by 1 second

      return () => clearTimeout(timeoutId)
    }
  }, [formData, currentStep, hasRestoredData])

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("hauler-onboarding-draft")
      if (savedData) {
        const parsed = JSON.parse(savedData)
        const savedTimestamp = new Date(parsed.timestamp)
        const now = new Date()
        const hoursSinceLastSave = (now.getTime() - savedTimestamp.getTime()) / (1000 * 60 * 60)

        if (hoursSinceLastSave < 24) {
          setShowRestorePrompt(true)
        } else {
          localStorage.removeItem("hauler-onboarding-draft")
          setHasRestoredData(true)
        }
      } else {
        setHasRestoredData(true)
      }
    } catch (error) {
      console.error("Failed to restore draft:", error)
      setHasRestoredData(true)
    }
  }, [])

  const handleRestoreData = () => {
    try {
      const savedData = localStorage.getItem("hauler-onboarding-draft")
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setFormData(parsed.formData)
        setCurrentStep(parsed.currentStep)
      }
    } catch (error) {
      console.error("Failed to restore data:", error)
    }
    setShowRestorePrompt(false)
    setHasRestoredData(true)
  }

  const handleDismissRestore = () => {
    localStorage.removeItem("hauler-onboarding-draft")
    setShowRestorePrompt(false)
    setHasRestoredData(true)
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    const updatedFields = Object.keys(updates)
    setErrors((prev) => {
      const newErrors = { ...prev }
      updatedFields.forEach((field) => {
        delete newErrors[field]
      })
      return newErrors
    })
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
        if (!formData.idNumber.trim()) newErrors.idNumber = "ID/Passport number is required"
        if (!formData.entityType) newErrors.entityType = "Entity type must be selected"
        if (formData.entityType === "business") {
          if (!formData.businessName.trim()) {
            newErrors.businessName = "Business name is required"
          }
          if (!formData.beeLevel.trim()) {
            newErrors.beeLevel = "BEEE Level is required for business entities"
          }
          if (!formData.cipcRegistration.trim()) {
            newErrors.cipcRegistration = "CIPC Registration Number is required for business entities"
          }
        }

        if (!formData.mobileNumber.trim()) {
          newErrors.mobileNumber = "Mobile number is required"
        } else {
          const cleanNumber = formData.mobileNumber.replace(/\s/g, "")
          if (!/^(\+27|0)[6-8][0-9]{8}$/.test(cleanNumber)) {
            newErrors.mobileNumber = "Invalid South African phone number format (e.g., +27 82 123 4567 or 082 123 4567)"
          }
        }

        if (!formData.email.trim()) {
          newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Invalid email format"
        }

        if (!formData.physicalAddress.trim()) newErrors.physicalAddress = "Physical address is required"
        if (!formData.province) newErrors.province = "Province is required"
        break

      case 2:
        if (formData.trucks.length === 0) {
          newErrors.trucks = "At least one truck is required"
        } else {
          formData.trucks.forEach((truck, index) => {
            if (!truck.vehicleType) {
              newErrors[`truck-${index}-vehicleType`] = `Vehicle type is required for truck ${index + 1}`
            }

            if (!truck.loadCapacity) {
              newErrors[`truck-${index}-loadCapacity`] = `Load capacity is required for truck ${index + 1}`
            } else {
              const capacity = Number.parseInt(truck.loadCapacity.split(" ")[0])
              if (capacity < 1 || capacity > 15) {
                newErrors[`truck-${index}-loadCapacity`] = `Truck ${index + 1} capacity must be between 1 and 15 tons`
              }
            }

            if (!truck.horseRegistration.trim()) {
              newErrors[`truck-${index}-horseRegistration`] = `Horse registration is required for truck ${index + 1}`
            }
          })
        }
        break

      case 3:
        if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required"
        if (!formData.accountHolderName.trim()) {
          newErrors.accountHolderName = "Account holder name is required"
        } else if (formData.accountHolderName.length < 2) {
          newErrors.accountHolderName = "Account holder name must be at least 2 characters"
        }

        if (!formData.accountNumber.trim()) {
          newErrors.accountNumber = "Account number is required"
        } else if (!/^\d{8,13}$/.test(formData.accountNumber)) {
          newErrors.accountNumber = "Account number must be 8-13 digits"
        }

        if (!formData.accountType) newErrors.accountType = "Account type is required"

        if (!formData.branchCode.trim()) {
          newErrors.branchCode = "Branch code is required"
        } else if (!/^\d{6}$/.test(formData.branchCode)) {
          newErrors.branchCode = "Branch code must be exactly 6 digits"
        }
        break

      case 4:
        if (!formData.documents || formData.documents.length === 0) {
          newErrors.documents = "At least one document must be uploaded"
        }
        break

      case 5:
        if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms of use to continue"
        if (!formData.consentToStore) newErrors.consentToStore = "You must consent to data storage to continue"
        if (!formData.consentToContact) newErrors.consentToContact = "You must consent to be contacted to continue"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
      setSubmitError("")
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setSubmitError("")
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const applicationData = {
        full_name: formData.fullName,
        id_number: formData.idNumber,
        entity_type: formData.entityType as "individual" | "business",
        business_name: formData.entityType === "business" ? formData.businessName : undefined,
        beee_level: formData.entityType === "business" ? formData.beeLevel : undefined,
        cipc_registration: formData.entityType === "business" ? formData.cipcRegistration : undefined,
        mobile_number: formData.mobileNumber,
        email: formData.email,
        physical_address: formData.physicalAddress,
        province: formData.province,
        bank_name: formData.bankName,
        account_holder_name: formData.accountHolderName,
        account_number: formData.accountNumber,
        account_type: formData.accountType,
        branch_code: formData.branchCode,
        accept_terms: formData.acceptTerms,
        consent_to_store: formData.consentToStore,
        consent_to_contact: formData.consentToContact,
      }

      const trucksData = formData.trucks.map((truck, index) => ({
        truck_number: index + 1,
        vehicle_type: truck.vehicleType,
        load_capacity: truck.loadCapacity,
        horse_registration: truck.horseRegistration,
        trailer1_registration: truck.trailer1Registration || undefined,
        trailer2_registration: truck.trailer2Registration || undefined,
      }))

      const documentsData = formData.documents.map((doc) => ({
        document_type: doc.type,
        file_name: doc.name,
        file_size: doc.size,
      }))

      const response = await fetch("/api/hauler-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationData,
          trucks: trucksData,
          documents: documentsData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save application")
      }

      const { applicationId, applicationNumber } = await response.json()

      const serviceId = "service_tch5rgi"
      const templateId = "template_ip0owji"
      const publicKey = "ByieGc7Pzw6Jt7f7I"

      const templateParams = {
        application_number: applicationNumber,
        applicant_name: formData.fullName,
        id_number: formData.idNumber,
        entity_type: formData.entityType === "business" ? "Business" : "Individual",
        business_name: formData.entityType === "business" ? formData.businessName : "",
        beee_level: formData.entityType === "business" ? formData.beeLevel : "",
        cipc_number: formData.entityType === "business" ? formData.cipcRegistration : "",
        mobile_number: formData.mobileNumber,
        email_address: formData.email,
        physical_address: formData.physicalAddress,
        province: formData.province,
        truck_count: formData.trucks.length.toString(),
        truck_details: formData.trucks.map((truck, index) => ({
          truck_number: (index + 1).toString(),
          vehicle_type: truck.vehicleType,
          load_capacity: truck.loadCapacity,
          horse_registration: truck.horseRegistration,
          trailer1_registration: truck.trailer1Registration || "",
          trailer2_registration: truck.trailer2Registration || "",
        })),
        bank_name: formData.bankName,
        account_holder: formData.accountHolderName,
        account_number: formData.accountNumber,
        account_type: formData.accountType,
        branch_code: formData.branchCode,
        terms_accepted: formData.acceptTerms ? "Yes" : "No",
        data_consent: formData.consentToStore ? "Yes" : "No",
        contact_consent: formData.consentToContact ? "Yes" : "No",
        submission_date: new Date().toLocaleString(),
        document_count: formData.documents.length.toString(),
        document_info: formData.documents
          .map((doc) => `${getDocumentTypeLabel(doc.type)}: ${doc.name} (${formatFileSize(doc.size)})`)
          .join("\n"),
      }

      await emailjs.send(serviceId, templateId, templateParams, publicKey)

      updateFormData({ applicationNumber } as any)
      setCurrentStep(6)

      localStorage.removeItem("hauler-onboarding-draft")
    } catch (error) {
      console.error("Submission error:", error)
      setSubmitError("Failed to submit application. Please try again or contact support.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 2:
        return <VehicleInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 3:
        return <BankingInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 4:
        return <DocumentUploadStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 5:
        return <TermsConsentStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 6:
        return <ConfirmationStep formData={formData} />
      default:
        return null
    }
  }

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="space-y-8 sm:space-y-12">
      {showRestorePrompt && (
        <Alert className="border-blue-200 bg-blue-50">
          <RotateCcw className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>We found a saved draft of your application. Would you like to continue where you left off?</span>
            <div className="flex gap-2 ml-4">
              <Button size="sm" variant="outline" onClick={handleDismissRestore}>
                Start Fresh
              </Button>
              <Button size="sm" onClick={handleRestoreData}>
                Restore Draft
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of {steps.length - 1}
          </div>
          <div className="flex items-center gap-3">
            {hasRestoredData && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {isAutoSaving ? (
                  <>
                    <Save className="h-3 w-3 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    Draft saved
                  </>
                )}
              </div>
            )}
            <div className="text-sm font-medium text-primary">{Math.round(progress)}% Complete</div>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="hidden sm:flex sm:justify-between">
          {steps.slice(0, -1).map((step, index) => (
            <div key={step.id} className="flex flex-col items-center space-y-3 flex-1">
              <div className="flex items-center justify-center">
                {currentStep > step.id ? (
                  <CheckCircle className="h-8 w-8 text-primary" />
                ) : currentStep === step.id ? (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-foreground">{step.id}</span>
                  </div>
                ) : (
                  <Circle className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="text-center max-w-32">
                <div
                  className={`text-sm font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sm:hidden">
          <div className="flex items-center justify-center space-x-2">
            {steps.slice(0, -1).map((step, index) => (
              <div key={step.id} className="flex items-center">
                {currentStep > step.id ? (
                  <CheckCircle className="h-6 w-6 text-primary" />
                ) : currentStep === step.id ? (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary-foreground">{step.id}</span>
                  </div>
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
                {index < steps.length - 2 && <div className="w-8 h-px bg-border mx-2" />}
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <div className="text-sm font-medium text-foreground">{steps[currentStep - 1]?.title}</div>
            <div className="text-xs text-muted-foreground">{steps[currentStep - 1]?.description}</div>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm sm:shadow-lg">
        <CardHeader className="pb-6 sm:pb-8 px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-semibold">{steps[currentStep - 1]?.title}</CardTitle>
          <CardDescription className="text-sm sm:text-base">{steps[currentStep - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {renderStep()}

          {currentStep < 6 && (
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-6 sm:pt-8 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
                className="flex items-center justify-center gap-2 bg-transparent h-11 sm:h-10 order-2 sm:order-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={currentStep === 5 ? handleSubmit : handleNext}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 h-11 sm:h-10 order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Submitting...
                  </>
                ) : currentStep === 5 ? (
                  "Submit Application"
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
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

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
