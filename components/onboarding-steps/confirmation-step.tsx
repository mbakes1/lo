"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Mail, Phone, FileText, Download } from "lucide-react"
import type { FormData } from "../hauler-onboarding-form"

interface ConfirmationStepProps {
  formData: FormData
}

export function ConfirmationStep({ formData }: ConfirmationStepProps) {
  const generateApplicationId = () => {
    return `HAU-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  }

  const applicationId = generateApplicationId()

  const handleDownloadSummary = () => {
    // In a real app, this would generate and download a PDF summary
    console.log("Downloading application summary...")
  }

  const handlePrintSummary = () => {
    window.print()
  }

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">Application Submitted Successfully!</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thank you, {formData.fullName}. Your hauler registration application has been received and is now under
            review.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 inline-block">
          <div className="text-sm text-muted-foreground">Application ID</div>
          <div className="text-xl font-mono font-semibold text-foreground">{applicationId}</div>
        </div>
      </div>

      {/* What Happens Next */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            What Happens Next
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Document Verification</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Our team will review your submitted documents including vehicle registration, insurance, and banking
                  details.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Timeline:</strong> 2-3 business days
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Background Verification</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll conduct background checks and verify your vehicle meets our safety and capacity requirements.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Timeline:</strong> 3-5 business days
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Account Activation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Once approved, you'll receive login credentials and access to our hauler platform to start accepting
                  deliveries.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Timeline:</strong> 1 business day after approval
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Stay Updated</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  We'll send email updates to <strong>{formData.email}</strong> and SMS notifications to{" "}
                  <strong>{formData.mobileNumber}</strong> throughout the review process.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      

      {/* Application Summary Actions */}
      

      {/* Final Thank You */}
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-foreground mb-3">Thank You for Choosing Our Platform</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We're excited to potentially welcome you to our network of professional haulers. Our team will review your
          application carefully and get back to you soon.
        </p>
      </div>
    </div>
  )
}
