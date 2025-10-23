import { NextResponse } from "next/server"
import { getEmpresas } from "@/lib/db"

export async function GET() {
  try {
    const empresas = await getEmpresas()
    return NextResponse.json(empresas)
  } catch (error) {
    console.error("[v0] Error fetching empresas:", error)
    return NextResponse.json({ error: "Failed to fetch empresas" }, { status: 500 })
  }
}
