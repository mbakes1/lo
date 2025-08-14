"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Lock } from "lucide-react"

interface PasswordDialogProps {
  open: boolean
  onAuthenticated: () => void
}

export function PasswordDialog({ open, onAuthenticated }: PasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Check password
    if (password === "Lope2025!") {
      // Store authentication in sessionStorage
      sessionStorage.setItem("admin_authenticated", "true")
      onAuthenticated()
    } else {
      setError("Incorrect password. Please try again.")
    }

    setIsLoading(false)
    setPassword("")
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">Admin Access Required</DialogTitle>
          <DialogDescription className="text-gray-600">
            Please enter the admin password to access the hauler management portal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !password.trim()}>
            {isLoading ? "Verifying..." : "Access Admin Portal"}
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500 mt-4">
          This portal is restricted to authorized personnel only.
        </div>
      </DialogContent>
    </Dialog>
  )
}
