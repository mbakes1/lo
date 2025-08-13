"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, FileText, Shield, Phone } from "lucide-react"
import type { FormData } from "../hauler-onboarding-form"

interface TermsConsentStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors: Record<string, string>
}

export function TermsConsentStep({ formData, updateFormData, errors }: TermsConsentStepProps) {
  const [showTermsPreview, setShowTermsPreview] = useState(false)
  const [showPrivacyPreview, setShowPrivacyPreview] = useState(false)

  return (
    <div className="space-y-8">
      {/* Terms and Conditions Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Terms and Conditions</h3>
          <p className="text-sm text-muted-foreground">
            Please review and accept our terms and conditions to complete your registration.
          </p>
        </div>

        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Terms of Use Agreement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => updateFormData({ acceptTerms: checked as boolean })}
                className={errors.acceptTerms ? "border-destructive" : ""}
              />
              <div className="space-y-2 flex-1">
                <Label htmlFor="acceptTerms" className="text-sm font-medium cursor-pointer">
                  I accept the Terms of Use <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, you agree to our terms of service, hauler agreement, and platform policies.
                </p>
                {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms}</p>}
              </div>
            </div>

            <Collapsible open={showTermsPreview} onOpenChange={setShowTermsPreview}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto text-sm text-primary hover:text-primary/80"
                >
                  View Terms Preview
                  {showTermsPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-3 max-h-64 overflow-y-auto">
                  <h4 className="font-semibold text-foreground">Key Terms Summary:</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>You must maintain valid vehicle registration and insurance</li>
                    <li>All deliveries must be completed professionally and on time</li>
                    <li>Payment terms are Net 7 days after delivery completion</li>
                    <li>You are responsible for vehicle maintenance and fuel costs</li>
                    <li>Platform commission rates apply to all completed deliveries</li>
                    <li>You must comply with all traffic laws and regulations</li>
                    <li>Cancellation policies apply to accepted delivery jobs</li>
                  </ul>
                  <p className="text-xs italic">
                    This is a summary. Full terms and conditions will be provided upon acceptance.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>

      {/* Privacy and Data Consent Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Privacy and Data Consent</h3>
          <p className="text-sm text-muted-foreground">
            We need your consent to store and process your personal information in accordance with privacy laws.
          </p>
        </div>

        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Data Processing Consent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentToStore"
                checked={formData.consentToStore}
                onCheckedChange={(checked) => updateFormData({ consentToStore: checked as boolean })}
                className={errors.consentToStore ? "border-destructive" : ""}
              />
              <div className="space-y-2 flex-1">
                <Label htmlFor="consentToStore" className="text-sm font-medium cursor-pointer">
                  I consent to data storage and processing <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  We will store your personal information securely and use it only for hauler services, payments, and
                  account management.
                </p>
                {errors.consentToStore && <p className="text-sm text-destructive">{errors.consentToStore}</p>}
              </div>
            </div>

            <Collapsible open={showPrivacyPreview} onOpenChange={setShowPrivacyPreview}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto text-sm text-primary hover:text-primary/80"
                >
                  View Privacy Policy Summary
                  {showPrivacyPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-3 max-h-64 overflow-y-auto">
                  <h4 className="font-semibold text-foreground">Data We Collect:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Personal identification information</li>
                    <li>Vehicle and insurance documentation</li>
                    <li>Banking details for payments</li>
                    <li>Location data during deliveries</li>
                    <li>Communication records and preferences</li>
                  </ul>
                  <h4 className="font-semibold text-foreground mt-4">How We Use Your Data:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Account verification and management</li>
                    <li>Payment processing and tax reporting</li>
                    <li>Delivery coordination and tracking</li>
                    <li>Customer support and communication</li>
                    <li>Platform improvement and analytics</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>

      {/* Communication Consent Section */}
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentToContact"
                checked={formData.consentToContact}
                onCheckedChange={(checked) => updateFormData({ consentToContact: checked as boolean })}
                className={errors.consentToContact ? "border-destructive" : ""}
              />
              <div className="space-y-2 flex-1">
                <Label htmlFor="consentToContact" className="text-sm font-medium cursor-pointer">
                  I consent to be contacted <span className="text-primary">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  We may contact you via phone, email, or SMS for delivery notifications, account updates, payment
                  information, and customer support.
                </p>
                {errors.consentToContact && <p className="text-sm text-destructive">{errors.consentToContact}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Legal Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        <div className="space-y-3">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100">Important Legal Information</h4>
          <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
            <p>
              <strong>Your Rights:</strong> You have the right to access, update, or delete your personal information at
              any time. You can withdraw consent for non-essential communications.
            </p>
            <p>
              <strong>Data Retention:</strong> Your information will be retained for as long as your account is active,
              plus any legally required retention periods.
            </p>
            <p>
              <strong>Contact Us:</strong> For questions about these terms or your data, contact our privacy team at
              privacy@haulerplatform.com
            </p>
          </div>
        </div>
      </div>

      {/* Consent Summary */}
      <div className="bg-muted/50 border border-muted rounded-lg p-6">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Consent Summary</h4>
          <p className="text-sm text-muted-foreground">
            By proceeding, you confirm that you have read, understood, and agree to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 mt-3">
            <li>✓ Terms of Use and Hauler Agreement</li>
            <li>✓ Privacy Policy and Data Processing</li>
            <li>✓ Communication and Contact Preferences</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
