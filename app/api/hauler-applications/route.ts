import { type NextRequest, NextResponse } from "next/server"
import { createHaulerApplication } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationData, trucks, documents } = body // Added documents from request body

    const result = await createHaulerApplication(applicationData, trucks, documents) // Pass documents to database function

    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}
