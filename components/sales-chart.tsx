"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Transaction } from "@/app/page"

type SalesChartProps = {
  transactions: Transaction[]
}

export function SalesChart({ transactions }: SalesChartProps) {
  const data = transactions.map((t) => ({
    name: t.orderNumber,
    "Valor Vendido": t.saleValue,
    "Valor Recebido": t.totalReceived,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(value)
          }
        />
        <Legend />
        <Bar dataKey="Valor Vendido" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Valor Recebido" fill="hsl(var(--status-received))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
