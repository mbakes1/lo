import { HaulerOnboardingForm } from "@/components/hauler-onboarding-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 sm:mb-6">
              Hauler Registration
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Join our network of professional haulers. Complete the registration process to start receiving delivery
              opportunities.
            </p>
          </div>
          <HaulerOnboardingForm />
        </div>
      </div>
    </main>
  )
}
