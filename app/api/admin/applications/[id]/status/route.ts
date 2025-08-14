import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = params.id
    const { status, notes } = await request.json()

    // Validate status
    const validStatuses = ["pending", "under_review", "approved", "rejected", "requires_documents"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update application status
    const [updatedApplication] = await sql`
      UPDATE hauler_applications 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${applicationId} OR application_number = ${applicationId}
      RETURNING *
    `

    if (!updatedApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Log status change (if we had a status history table)
    // For now, we'll just return the updated application

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: `Application status updated to ${status}`,
    })
  } catch (error) {
    console.error("Failed to update application status:", error)
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
  }
}
