"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Transaction } from "@/app/page"

type StatusPieChartProps = {
  transactions: Transaction[]
}

export function StatusPieChart({ transactions }: StatusPieChartProps) {
  const statusCounts = {
    received: transactions.filter((t) => t.status === "received").length,
    partial: transactions.filter((t) => t.status === "partial").length,
    pending: transactions.filter((t) => t.status === "pending").length,
    divergent: transactions.filter((t) => t.status === "divergent").length,
  }

  const data = [
    { name: "Recebido", value: statusCounts.received, color: "#16A34A" }, // Green
    { name: "Parcial", value: statusCounts.partial, color: "#FACC15" }, // Yellow
    { name: "Pendente", value: statusCounts.pending, color: "#DC2626" }, // Red
    { name: "Divergente", value: statusCounts.divergent, color: "#F97316" }, // Orange
  ].filter((item) => item.value > 0)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
