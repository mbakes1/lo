import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const entityType = searchParams.get("entity_type")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")
    const minTrucks = searchParams.get("min_trucks")
    const maxTrucks = searchParams.get("max_trucks")
    const hasDocuments = searchParams.get("has_documents")

    let applications

    if (status && status !== "all" && search && entityType && entityType !== "all" && dateFrom && dateTo) {
      // All filters applied
      applications = await sql`
        SELECT 
          ha.application_number,
          ha.full_name,
          ha.id_number,
          ha.entity_type,
          ha.business_name,
          ha.beee_level,
          ha.cipc_registration,
          ha.mobile_number,
          ha.email,
          ha.physical_address,
          ha.province,
          ha.bank_name,
          ha.account_holder_name,
          ha.account_number,
          ha.account_type,
          ha.branch_code,
          ha.status,
          ha.created_at,
          COUNT(DISTINCT ht.id) as truck_count,
          COUNT(DISTINCT hd.id) as document_count
        FROM hauler_applications ha
        LEFT JOIN hauler_trucks ht ON ha.id = ht.application_id
        LEFT JOIN hauler_documents hd ON ha.id = hd.application_id
        WHERE ha.status = ${status}
        AND ha.entity_type = ${entityType}
        AND ha.created_at >= ${dateFrom}
        AND ha.created_at <= ${dateTo}
        AND (
          ha.full_name ILIKE ${`%${search}%`} OR 
          ha.application_number ILIKE ${`%${search}%`} OR
          ha.email ILIKE ${`%${search}%`}
        )
        GROUP BY ha.id
        ORDER BY ha.created_at DESC
      `
    } else if (status && status !== "all" && search) {
      // Status and search filters
      applications = await sql`
        SELECT 
          ha.application_number,
          ha.full_name,
          ha.id_number,
          ha.entity_type,
          ha.business_name,
          ha.beee_level,
          ha.cipc_registration,
          ha.mobile_number,
          ha.email,
          ha.physical_address,
          ha.province,
          ha.bank_name,
          ha.account_holder_name,
          ha.account_number,
          ha.account_type,
          ha.branch_code,
          ha.status,
          ha.created_at,
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
      `
    } else if (status && status !== "all") {
      // Only status filter
      applications = await sql`
        SELECT 
          ha.application_number,
          ha.full_name,
          ha.id_number,
          ha.entity_type,
          ha.business_name,
          ha.beee_level,
          ha.cipc_registration,
          ha.mobile_number,
          ha.email,
          ha.physical_address,
          ha.province,
          ha.bank_name,
          ha.account_holder_name,
          ha.account_number,
          ha.account_type,
          ha.branch_code,
          ha.status,
          ha.created_at,
          COUNT(DISTINCT ht.id) as truck_count,
          COUNT(DISTINCT hd.id) as document_count
        FROM hauler_applications ha
        LEFT JOIN hauler_trucks ht ON ha.id = ht.application_id
        LEFT JOIN hauler_documents hd ON ha.id = hd.application_id
        WHERE ha.status = ${status}
        GROUP BY ha.id
        ORDER BY ha.created_at DESC
      `
    } else if (search) {
      // Only search filter
      applications = await sql`
        SELECT 
          ha.application_number,
          ha.full_name,
          ha.id_number,
          ha.entity_type,
          ha.business_name,
          ha.beee_level,
          ha.cipc_registration,
          ha.mobile_number,
          ha.email,
          ha.physical_address,
          ha.province,
          ha.bank_name,
          ha.account_holder_name,
          ha.account_number,
          ha.account_type,
          ha.branch_code,
          ha.status,
          ha.created_at,
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
      `
    } else {
      // No filters
      applications = await sql`
        SELECT 
          ha.application_number,
          ha.full_name,
          ha.id_number,
          ha.entity_type,
          ha.business_name,
          ha.beee_level,
          ha.cipc_registration,
          ha.mobile_number,
          ha.email,
          ha.physical_address,
          ha.province,
          ha.bank_name,
          ha.account_holder_name,
          ha.account_number,
          ha.account_type,
          ha.branch_code,
          ha.status,
          ha.created_at,
          COUNT(DISTINCT ht.id) as truck_count,
          COUNT(DISTINCT hd.id) as document_count
        FROM hauler_applications ha
        LEFT JOIN hauler_trucks ht ON ha.id = ht.application_id
        LEFT JOIN hauler_documents hd ON ha.id = hd.application_id
        GROUP BY ha.id
        ORDER BY ha.created_at DESC
      `
    }

    // Generate CSV
    const headers = [
      "Application Number",
      "Full Name",
      "ID Number",
      "Entity Type",
      "Business Name",
      "BEEE Level",
      "CIPC Registration",
      "Mobile Number",
      "Email",
      "Physical Address",
      "Province",
      "Bank Name",
      "Account Holder",
      "Account Number",
      "Account Type",
      "Branch Code",
      "Status",
      "Truck Count",
      "Document Count",
      "Submitted Date",
    ]

    const csvRows = [
      headers.join(","),
      ...applications.map((app: any) =>
        [
          app.application_number,
          `"${app.full_name}"`,
          app.id_number,
          app.entity_type,
          `"${app.business_name || ""}"`,
          app.beee_level || "",
          app.cipc_registration || "",
          app.mobile_number,
          app.email,
          `"${app.physical_address}"`,
          app.province,
          `"${app.bank_name}"`,
          `"${app.account_holder_name}"`,
          app.account_number,
          app.account_type,
          app.branch_code,
          app.status,
          app.truck_count,
          app.document_count,
          new Date(app.created_at).toISOString(),
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="hauler-applications-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Failed to export applications:", error)
    return NextResponse.json({ error: "Failed to export applications" }, { status: 500 })
  }
}
