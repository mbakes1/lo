import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = params.id

    let application

    // Check if the parameter is a numeric ID or an application number
    if (/^\d+$/.test(applicationId)) {
      // It's a numeric ID
      const result = await sql`
        SELECT * FROM hauler_applications 
        WHERE id = ${Number.parseInt(applicationId)}
      `
      application = result[0]
    } else {
      // It's an application number (string)
      const result = await sql`
        SELECT * FROM hauler_applications 
        WHERE application_number = ${applicationId}
      `
      application = result[0]
    }

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Fetch trucks for this application
    const trucks = await sql`
      SELECT * FROM hauler_trucks 
      WHERE application_id = ${application.id}
      ORDER BY truck_number
    `

    let documents = []
    try {
      documents = await sql`
        SELECT * FROM hauler_documents 
        WHERE application_id = ${application.id}
        ORDER BY created_at
      `
    } catch (docError) {
      console.warn("Documents table not found, returning empty array:", docError)
      documents = []
    }

    return NextResponse.json({
      application,
      trucks,
      documents,
    })
  } catch (error) {
    console.error("Failed to fetch application details:", error)
    return NextResponse.json({ error: "Failed to fetch application details" }, { status: 500 })
  }
}
