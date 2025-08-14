import { type NextRequest, NextResponse } from "next/server"
import { getHaulerApplication } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { applicationNumber: string } }) {
  try {
    const application = await getHaulerApplication(params.applicationNumber)

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to retrieve application" }, { status: 500 })
  }
}
