import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "")

export async function GET() {
  try {
    const recentApplications = await sql`
      SELECT 
        id,
        application_number,
        full_name,
        business_name,
        entity_type,
        status,
        created_at
      FROM hauler_applications 
      ORDER BY created_at DESC 
      LIMIT 5
    `

    return NextResponse.json(recentApplications)
  } catch (error) {
    console.error("Error fetching recent applications:", error)
    return NextResponse.json({ error: "Failed to fetch recent applications" }, { status: 500 })
  }
}
