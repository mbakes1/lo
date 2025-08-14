import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let applications, total

    if (status && status !== "all" && search) {
      // Both status and search filters
      applications = await sql`
        SELECT 
          ha.*,
          COUNT(DISTINCT ht.id) as truck_count,
          COUNT(DISTINCT hd.id) as document_count
        FROM hauler_applications ha
        LEFT JOIN hauler_trucks ht ON ha.id = ht.application_id
        LEFT JOIN hauler_documents hd ON ha.id = hd.application_id
        WHERE ha.status = ${status}
        AND (
          ha.full_name ILIKE ${`%${search}%`} OR 
          ha.application_number ILIKE ${`%${search}%`} OR
          ha.email ILIKE ${`%${search}%`}
        )
        GROUP BY ha.id
        ORDER BY ha.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`
        SELECT COUNT(DISTINCT ha.id) as total 
        FROM hauler_applications ha
        WHERE ha.status = ${status}
        AND (
          ha.full_name ILIKE ${`%${search}%`} OR 
          ha.application_number ILIKE ${`%${search}%`} OR
          ha.email ILIKE ${`%${search}%`}
        )
      `
      total = countResult[0].total
    } else if (status && status !== "all") {
      // Only status filter
      applications = await sql`
        SELECT 
          ha.*,
          COUNT(DISTINCT ht.id) as truck_count,
          COUNT(DISTINCT hd.id) as document_count
        FROM hauler_applications ha
        LEFT JOIN hauler_trucks ht ON ha.id = ht.application_id
        LEFT JOIN hauler_documents hd ON ha.id = hd.application_id
        WHERE ha.status = ${status}
        GROUP BY ha.id
        ORDER BY ha.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`
        SELECT COUNT(DISTINCT ha.id) as total 
        FROM hauler_applications ha
        WHERE ha.status = ${status}
      `
      total = countResult[0].total
    } else if (search) {
      // Only search filter
      applications = await sql`
        SELECT 
          ha.*,
          COUNT(DISTINCT ht.id) as truck_count,
          COUNT(DISTINCT hd.id) as document_count
        FROM hauler_applications ha
        LEFT JOIN hauler_trucks ht ON ha.id = ht.application_id
        LEFT JOIN hauler_documents hd ON ha.id = hd.application_id
        WHERE (
          ha.full_name ILIKE ${`%${search}%`} OR 
          ha.application_number ILIKE ${`%${search}%`} OR
          ha.email ILIKE ${`%${search}%`}
        )
        GROUP BY ha.id
        ORDER BY ha.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`
        SELECT COUNT(DISTINCT ha.id) as total 
        FROM hauler_applications ha
        WHERE (
          ha.full_name ILIKE ${`%${search}%`} OR 
          ha.application_number ILIKE ${`%${search}%`} OR
          ha.email ILIKE ${`%${search}%`}
        )
      `
      total = countResult[0].total
    } else {
      // No filters
      applications = await sql`
        SELECT 
          ha.*,
          COUNT(DISTINCT ht.id) as truck_count,
          COUNT(DISTINCT hd.id) as document_count
        FROM hauler_applications ha
        LEFT JOIN hauler_trucks ht ON ha.id = ht.application_id
        LEFT JOIN hauler_documents hd ON ha.id = hd.application_id
        GROUP BY ha.id
        ORDER BY ha.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`
        SELECT COUNT(DISTINCT ha.id) as total 
        FROM hauler_applications ha
      `
      total = countResult[0].total
    }

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total: Number.parseInt(total),
        pages: Math.ceil(Number.parseInt(total) / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
