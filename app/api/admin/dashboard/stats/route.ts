import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "")

export async function GET() {
  try {
    // Get application counts by status
    const [stats] = await sql`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'requires_documents' THEN 1 END) as requires_documents,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review
      FROM hauler_applications
    `

    return NextResponse.json({
      totalApplications: Number.parseInt(stats.total_applications) || 0,
      pendingReview: Number.parseInt(stats.pending_review) || 0,
      approved: Number.parseInt(stats.approved) || 0,
      rejected: Number.parseInt(stats.rejected) || 0,
      requiresDocuments: Number.parseInt(stats.requires_documents) || 0,
      underReview: Number.parseInt(stats.under_review) || 0,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}
