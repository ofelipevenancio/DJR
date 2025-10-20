"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Transaction } from "@/app/page"

type TimelineChartProps = {
  transactions: Transaction[]
}

export function TimelineChart({ transactions }: TimelineChartProps) {
  const monthlyData = transactions.reduce(
    (acc, t) => {
      try {
        // Parse date safely
        let date: Date
        if (/^\d{4}-\d{2}-\d{2}$/.test(t.saleDate)) {
          date = new Date(t.saleDate + "T00:00:00")
        } else {
          date = new Date(t.saleDate)
        }

        if (isNaN(date.getTime())) {
          return acc
        }

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        if (!acc[monthKey]) {
          acc[monthKey] = { month: monthKey, vendido: 0, recebido: 0 }
        }

        acc[monthKey].vendido += t.saleValue
        acc[monthKey].recebido += t.totalReceived

        return acc
      } catch (error) {
        console.error("[v0] Error processing date in timeline chart:", t.saleDate, error)
        return acc
      }
    },
    {} as Record<string, { month: string; vendido: number; recebido: number }>,
  )
  // </CHANGE>

  const data = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" tickFormatter={formatMonth} />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelFormatter={formatMonth}
          formatter={(value: number) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(value)
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="vendido"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="Vendido"
          dot={{ fill: "hsl(var(--primary))" }}
        />
        <Line
          type="monotone"
          dataKey="recebido"
          stroke="hsl(var(--status-received))"
          strokeWidth={2}
          name="Recebido"
          dot={{ fill: "hsl(var(--status-received))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
