"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, AlertCircle, Clock, AlertTriangle, Pencil } from "lucide-react"
import type { Transaction } from "@/app/page"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import { formatDate } from "@/lib/utils"

type TransactionsTableProps = {
  transactions: Transaction[]
  onUpdateTransaction: (id: string, transaction: Omit<Transaction, "id" | "status">) => void
}

export function TransactionsTable({ transactions, onUpdateTransaction }: TransactionsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [companyFilter, setCompanyFilter] = useState<string>("all")
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  // </CHANGE>

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter
    const matchesCompany = companyFilter === "all" || t.company === companyFilter
    return matchesStatus && matchesCompany
  })

  const getStatusConfig = (status: Transaction["status"]) => {
    switch (status) {
      case "received":
        return {
          label: "Recebido",
          variant: "default" as const,
          icon: CheckCircle2,
          className: "bg-status-received text-status-received-foreground hover:bg-status-received/80",
        }
      case "partial":
        return {
          label: "Parcial",
          variant: "secondary" as const,
          icon: Clock,
          className: "bg-status-partial text-status-partial-foreground hover:bg-status-partial/80",
        }
      case "pending":
        return {
          label: "Pendente",
          variant: "destructive" as const,
          icon: AlertCircle,
          className: "bg-status-pending text-status-pending-foreground hover:bg-status-pending/80",
        }
      case "divergent":
        return {
          label: "Divergente",
          variant: "outline" as const,
          icon: AlertTriangle,
          className:
            "bg-status-divergent text-status-divergent-foreground hover:bg-status-divergent/80 border-status-divergent",
        }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Filtrar por empresa:</label>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Klabin">Klabin</SelectItem>
              <SelectItem value="Jaepel">Jaepel</SelectItem>
              <SelectItem value="Fernandez">Fernandez</SelectItem>
              <SelectItem value="Vale Tambau">Vale Tambau</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Filtrar por status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="received">Recebido</SelectItem>
              <SelectItem value="partial">Parcial</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="divergent">Divergente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Pedido</TableHead>
                <TableHead className="font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Empresa</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold text-right">Valor Venda</TableHead>
                <TableHead className="font-semibold text-right">Total NF</TableHead>
                <TableHead className="font-semibold text-right">Total Recebido</TableHead>
                <TableHead className="font-semibold text-right">Diferença</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Ações</TableHead>
                {/* </CHANGE> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    Nenhum lançamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const statusConfig = getStatusConfig(transaction.status)
                  const StatusIcon = statusConfig.icon
                  const difference = transaction.totalReceived - transaction.saleValue

                  return (
                    <TableRow key={transaction.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{transaction.orderNumber}</TableCell>
                      <TableCell>{formatDate(transaction.saleDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {transaction.company}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.client}</TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.saleValue === 0 ? (
                          <span className="text-muted-foreground italic">A definir</span>
                        ) : (
                          formatCurrency(transaction.saleValue)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.invoiceTotal === 0 ? (
                          <span className="text-muted-foreground italic">A definir</span>
                        ) : (
                          formatCurrency(transaction.invoiceTotal)
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.totalReceived === 0 ? (
                          <span className="text-muted-foreground italic">Não recebido</span>
                        ) : (
                          formatCurrency(transaction.totalReceived)
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          transaction.saleValue === 0
                            ? "text-muted-foreground"
                            : difference > 0
                              ? "text-status-divergent"
                              : difference < 0
                                ? "text-status-pending"
                                : "text-status-received"
                        }`}
                      >
                        {transaction.saleValue === 0 ? <span className="italic">-</span> : formatCurrency(difference)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTransaction(transaction)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      {/* </CHANGE> */}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          onSave={(updatedTransaction) => {
            onUpdateTransaction(editingTransaction.id, updatedTransaction)
            setEditingTransaction(null)
          }}
        />
      )}
      {/* </CHANGE> */}
    </div>
  )
}
