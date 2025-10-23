import { NextResponse } from "next/server"
import { getContasBancarias } from "@/lib/db"

export async function GET() {
  try {
    const contas = await getContasBancarias()
    return NextResponse.json(contas)
  } catch (error) {
    console.error("[v0] Error fetching contas bancarias:", error)
    return NextResponse.json({ error: "Failed to fetch contas bancarias" }, { status: 500 })
  }
}
