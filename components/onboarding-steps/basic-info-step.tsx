"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { FormData } from "../hauler-onboarding-form"

interface BasicInfoStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors: Record<string, string>
}

const southAfricanProvinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
]

const beeLevels = [
  "Level 1 (135% B-BBEE recognition)",
  "Level 2 (125% B-BBEE recognition)",
  "Level 3 (110% B-BBEE recognition)",
  "Level 4 (100% B-BBEE recognition)",
  "Level 5 (80% B-BBEE recognition)",
  "Level 6 (60% B-BBEE recognition)",
  "Level 7 (50% B-BBEE recognition)",
  "Level 8 (10% B-BBEE recognition)",
  "Non-compliant (0% B-BBEE recognition)",
]

export function BasicInfoStep({ formData, updateFormData, errors }: BasicInfoStepProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Personal Information Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
          <p className="text-sm text-muted-foreground">
            Please provide your personal details as they appear on your official documents.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              className={`h-11 ${errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber" className="text-sm font-medium">
              ID or Passport Number <span className="text-primary">*</span>
            </Label>
            <Input
              id="idNumber"
              placeholder="Enter your ID or passport number"
              value={formData.idNumber}
              onChange={(e) => updateFormData({ idNumber: e.target.value })}
              className={`h-11 ${errors.idNumber ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.idNumber && <p className="text-sm text-destructive">{errors.idNumber}</p>}
          </div>
        </div>
      </div>

      {/* Entity Type Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Entity Type</h3>
          <p className="text-sm text-muted-foreground">
            Select whether you are registering as an individual or business entity.
          </p>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium">
            Registration Type <span className="text-primary">*</span>
          </Label>
          <RadioGroup
            value={formData.entityType}
            onValueChange={(value) => updateFormData({ entityType: value as "individual" | "business" })}
            className="flex flex-col space-y-3"
          >
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="individual" id="individual" className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <Label htmlFor="individual" className="font-medium cursor-pointer text-sm sm:text-base">
                  Individual
                </Label>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Register as an individual hauler operating under your personal name
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="business" id="business" className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <Label htmlFor="business" className="font-medium cursor-pointer text-sm sm:text-base">
                  Business
                </Label>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Register as a business entity with a registered company name
                </p>
              </div>
            </div>
          </RadioGroup>
          {errors.entityType && <p className="text-sm text-destructive">{errors.entityType}</p>}
        </div>

        {formData.entityType === "business" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium">
                Business Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="businessName"
                placeholder="Enter your registered business name"
                value={formData.businessName}
                onChange={(e) => updateFormData({ businessName: e.target.value })}
                className={`h-11 ${errors.businessName ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.businessName && <p className="text-sm text-destructive">{errors.businessName}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="beeLevel" className="text-sm font-medium">
                  BEEE Level <span className="text-primary">*</span>
                </Label>
                <Select value={formData.beeLevel} onValueChange={(value) => updateFormData({ beeLevel: value })}>
                  <SelectTrigger
                    className={`h-11 ${errors.beeLevel ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  >
                    <SelectValue placeholder="Select your BEEE level" />
                  </SelectTrigger>
                  <SelectContent>
                    {beeLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.beeLevel && <p className="text-sm text-destructive">{errors.beeLevel}</p>}
                <p className="text-xs text-muted-foreground">Your current B-BBEE certification level</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cipcRegistration" className="text-sm font-medium">
                  CIPC Registration Number <span className="text-primary">*</span>
                </Label>
                <Input
                  id="cipcRegistration"
                  placeholder="e.g., 2021/123456/07"
                  value={formData.cipcRegistration}
                  onChange={(e) => updateFormData({ cipcRegistration: e.target.value })}
                  className={`h-11 ${errors.cipcRegistration ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.cipcRegistration && <p className="text-sm text-destructive">{errors.cipcRegistration}</p>}
                <p className="text-xs text-muted-foreground">Your company registration number from CIPC</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide your contact details for communication regarding deliveries and account updates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="text-sm font-medium">
              Mobile Number <span className="text-primary">*</span>
            </Label>
            <Input
              id="mobileNumber"
              placeholder="e.g., +27 82 123 4567"
              value={formData.mobileNumber}
              onChange={(e) => updateFormData({ mobileNumber: e.target.value })}
              className={`h-11 ${errors.mobileNumber ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.mobileNumber && <p className="text-sm text-destructive">{errors.mobileNumber}</p>}
            <p className="text-xs text-muted-foreground">South African mobile number format required</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address <span className="text-primary">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className={`h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Address Information</h3>
          <p className="text-sm text-muted-foreground">
            Your physical address is required for verification and delivery coordination purposes.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="physicalAddress" className="text-sm font-medium">
              Physical Address <span className="text-primary">*</span>
            </Label>
            <Textarea
              id="physicalAddress"
              placeholder="Enter your complete physical address including street number, street name, suburb, and city"
              value={formData.physicalAddress}
              onChange={(e) => updateFormData({ physicalAddress: e.target.value })}
              className={`min-h-[100px] resize-none ${errors.physicalAddress ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.physicalAddress && <p className="text-sm text-destructive">{errors.physicalAddress}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="province" className="text-sm font-medium">
              Province <span className="text-primary">*</span>
            </Label>
            <Select value={formData.province} onValueChange={(value) => updateFormData({ province: value })}>
              <SelectTrigger
                className={`h-11 ${errors.province ? "border-destructive focus-visible:ring-destructive" : ""}`}
              >
                <SelectValue placeholder="Select your province" />
              </SelectTrigger>
              <SelectContent>
                {southAfricanProvinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.province && <p className="text-sm text-destructive">{errors.province}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
