import { NextResponse } from "next/server"
import { getFormasRecebimento } from "@/lib/db"

export async function GET() {
  try {
    const formas = await getFormasRecebimento()
    return NextResponse.json(formas)
  } catch (error) {
    console.error("[v0] Error fetching formas recebimento:", error)
    return NextResponse.json({ error: "Failed to fetch formas recebimento" }, { status: 500 })
  }
}
