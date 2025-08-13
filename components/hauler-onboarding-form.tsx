"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BasicInfoStep } from "./onboarding-steps/basic-info-step"
import { VehicleInfoStep } from "./onboarding-steps/vehicle-info-step"
import { BankingInfoStep } from "./onboarding-steps/banking-info-step"
import { TermsConsentStep } from "./onboarding-steps/terms-consent-step"
import { ConfirmationStep } from "./onboarding-steps/confirmation-step"
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
}

const steps = [
  { id: 1, title: "Basic Information", description: "Personal and contact details" },
  { id: 2, title: "Vehicle Information", description: "Truck details and registration" },
  { id: 3, title: "Banking Details", description: "Payment and account information" },
  { id: 4, title: "Terms & Consent", description: "Agreement and permissions" },
  { id: 5, title: "Confirmation", description: "Review and submit" },
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
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    // Clear related errors when user updates fields
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
        // Basic validation
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

        // Enhanced mobile number validation
        if (!formData.mobileNumber.trim()) {
          newErrors.mobileNumber = "Mobile number is required"
        } else {
          const cleanNumber = formData.mobileNumber.replace(/\s/g, "")
          if (!/^(\+27|0)[6-8][0-9]{8}$/.test(cleanNumber)) {
            newErrors.mobileNumber = "Invalid South African phone number format (e.g., +27 82 123 4567 or 082 123 4567)"
          }
        }

        // Enhanced email validation
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

        // Enhanced account number validation
        if (!formData.accountNumber.trim()) {
          newErrors.accountNumber = "Account number is required"
        } else if (!/^\d{8,13}$/.test(formData.accountNumber)) {
          newErrors.accountNumber = "Account number must be 8-13 digits"
        }

        if (!formData.accountType) newErrors.accountType = "Account type is required"

        // Enhanced branch code validation
        if (!formData.branchCode.trim()) {
          newErrors.branchCode = "Branch code is required"
        } else if (!/^\d{6}$/.test(formData.branchCode)) {
          newErrors.branchCode = "Branch code must be exactly 6 digits"
        }
        break

      case 4:
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
      const serviceId = "service_tch5rgi"
      const templateId = "template_ip0owji"
      const publicKey = "ByieGc7Pzw6Jt7f7I"

      const templateParams = {
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
      }

      await emailjs.send(serviceId, templateId, templateParams, publicKey)

      setCurrentStep(5)
    } catch (error) {
      console.error("Email submission error:", error)
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
        return <TermsConsentStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 5:
        return <ConfirmationStep formData={formData} />
      default:
        return null
    }
  }

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Progress Section */}
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of {steps.length - 1}
          </div>
          <div className="text-sm font-medium text-primary">{Math.round(progress)}% Complete</div>
        </div>

        <Progress value={progress} className="h-2" />

        {/* Step Indicators */}
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

      {/* Form Content */}
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

          {/* Navigation Buttons */}
          {currentStep < 5 && (
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
                onClick={currentStep === 4 ? handleSubmit : handleNext}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 h-11 sm:h-10 order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Submitting...
                  </>
                ) : currentStep === 4 ? (
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
