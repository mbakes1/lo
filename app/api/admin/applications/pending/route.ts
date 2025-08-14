import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "")

export async function GET() {
  try {
    const pendingApplications = await sql`
      SELECT 
        ha.*,
        COUNT(ht.id) as truck_count
      FROM hauler_applications ha
      LEFT JOIN hauler_trucks ht ON ha.id = ht.application_id
      WHERE ha.status IN ('pending', 'under_review')
      GROUP BY ha.id
      ORDER BY ha.created_at ASC
    `

    return NextResponse.json(pendingApplications)
  } catch (error) {
    console.error("Error fetching pending applications:", error)
    return NextResponse.json({ error: "Failed to fetch pending applications" }, { status: 500 })
  }
}
