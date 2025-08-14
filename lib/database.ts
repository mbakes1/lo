import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "")

export interface HaulerApplication {
  id?: number
  application_number?: string
  full_name: string
  id_number: string
  entity_type: "individual" | "business"
  business_name?: string
  beee_level?: string
  cipc_registration?: string
  mobile_number: string
  email: string
  physical_address: string
  province: string
  bank_name: string
  account_holder_name: string
  account_number: string
  account_type: string
  branch_code: string
  accept_terms: boolean
  consent_to_store: boolean
  consent_to_contact: boolean
  status?: "pending" | "under_review" | "approved" | "rejected" | "requires_documents"
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface HaulerTruck {
  id?: number
  application_id: number
  truck_number: number
  vehicle_type: string
  load_capacity: string
  horse_registration: string
  trailer1_registration?: string
  trailer2_registration?: string
}

export interface HaulerDocument {
  id?: number
  application_id: number
  document_type: string
  file_name: string
  file_size: number
  file_path?: string
  uploaded_at?: string
}

export async function createHaulerApplication(
  applicationData: Omit<HaulerApplication, "id" | "application_number" | "created_at" | "updated_at">,
  trucks: Omit<HaulerTruck, "id" | "application_id">[],
  documents?: Omit<HaulerDocument, "id" | "application_id" | "uploaded_at">[], // Added documents parameter
): Promise<{ applicationId: number; applicationNumber: string }> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    // Insert the main application
    const [application] = await sql`
      INSERT INTO hauler_applications (
        full_name, id_number, entity_type, business_name, beee_level, cipc_registration,
        mobile_number, email, physical_address, province,
        bank_name, account_holder_name, account_number, account_type, branch_code,
        accept_terms, consent_to_store, consent_to_contact
      ) VALUES (
        ${applicationData.full_name}, ${applicationData.id_number}, ${applicationData.entity_type},
        ${applicationData.business_name || null}, ${applicationData.beee_level || null}, 
        ${applicationData.cipc_registration || null}, ${applicationData.mobile_number}, 
        ${applicationData.email}, ${applicationData.physical_address}, ${applicationData.province},
        ${applicationData.bank_name}, ${applicationData.account_holder_name}, 
        ${applicationData.account_number}, ${applicationData.account_type}, ${applicationData.branch_code},
        ${applicationData.accept_terms}, ${applicationData.consent_to_store}, ${applicationData.consent_to_contact}
      )
      RETURNING id, application_number
    `

    // Insert trucks
    for (const truck of trucks) {
      await sql`
        INSERT INTO hauler_trucks (
          application_id, truck_number, vehicle_type, load_capacity,
          horse_registration, trailer1_registration, trailer2_registration
        ) VALUES (
          ${application.id}, ${truck.truck_number}, ${truck.vehicle_type}, ${truck.load_capacity},
          ${truck.horse_registration}, ${truck.trailer1_registration || null}, 
          ${truck.trailer2_registration || null}
        )
      `
    }

    if (documents && documents.length > 0) {
      try {
        for (const document of documents) {
          await sql`
            INSERT INTO hauler_documents (
              application_id, document_type, file_name, file_size
            ) VALUES (
              ${application.id}, ${document.document_type}, ${document.file_name}, ${document.file_size}
            )
          `
        }
      } catch (documentError: any) {
        // If documents table doesn't exist, log warning but don't fail the application
        if (documentError.message?.includes('relation "hauler_documents" does not exist')) {
          console.warn(
            "Documents table doesn't exist yet. Run scripts/002-add-documents-table.sql to enable document storage.",
          )
        } else {
          console.error("Error saving documents:", documentError)
        }
      }
    }

    return {
      applicationId: application.id,
      applicationNumber: application.application_number,
    }
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to save application to database")
  }
}

export async function getHaulerApplication(
  applicationNumber: string,
): Promise<(HaulerApplication & { trucks: HaulerTruck[]; documents: HaulerDocument[] }) | null> {
  // Added documents to return type
  try {
    const [application] = await sql`
      SELECT * FROM hauler_applications 
      WHERE application_number = ${applicationNumber}
    `

    if (!application) return null

    const trucks = await sql`
      SELECT * FROM hauler_trucks 
      WHERE application_id = ${application.id}
      ORDER BY truck_number
    `

    let documents: HaulerDocument[] = []
    try {
      documents = await sql`
        SELECT * FROM hauler_documents 
        WHERE application_id = ${application.id}
        ORDER BY uploaded_at
      `
    } catch (documentError: any) {
      if (documentError.message?.includes('relation "hauler_documents" does not exist')) {
        console.warn(
          "Documents table doesn't exist yet. Run scripts/002-add-documents-table.sql to enable document retrieval.",
        )
      } else {
        console.error("Error retrieving documents:", documentError)
      }
    }

    return {
      ...application,
      trucks,
      documents, // Include documents in return (empty array if table doesn't exist)
    }
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to retrieve application from database")
  }
}

export async function updateApplicationStatus(
  applicationNumber: string,
  status: HaulerApplication["status"],
  notes?: string,
  reviewedBy?: string,
): Promise<void> {
  try {
    await sql`
      UPDATE hauler_applications 
      SET status = ${status}, 
          notes = ${notes || null},
          reviewed_by = ${reviewedBy || null},
          reviewed_at = ${status !== "pending" ? sql`CURRENT_TIMESTAMP` : null}
      WHERE application_number = ${applicationNumber}
    `
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to update application status")
  }
}
