"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Clock, AlertTriangle, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import type { Transaction } from "@/app/page"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import { formatDate } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type TransactionsTableProps = {
  transactions: Transaction[]
  onUpdateTransaction: (id: string, transaction: Omit<Transaction, "id" | "status">) => void
  onDeleteTransaction: (id: string) => void
  onBulkDelete?: (ids: string[]) => void
  isReadOnly?: boolean
}

function MobileTransactionCard({
  transaction,
  onEdit,
  onDelete,
  isReadOnly,
  isSelected,
  onSelect,
}: {
  transaction: Transaction
  onEdit: () => void
  onDelete: () => void
  isReadOnly: boolean
  isSelected: boolean
  onSelect: (checked: boolean) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const getStatusConfig = (status: Transaction["status"]) => {
    switch (status) {
      case "received":
        return {
          label: "Recebido",
          className: "bg-status-received text-status-received-foreground",
          icon: CheckCircle2,
        }
      case "partial":
        return {
          label: "Parcial",
          className: "bg-status-partial text-status-partial-foreground",
          icon: Clock,
        }
      case "pending":
        return {
          label: "Pendente",
          className: "bg-status-pending text-status-pending-foreground",
          icon: AlertCircle,
        }
      case "divergent":
        return {
          label: "Divergente",
          className: "bg-status-divergent text-status-divergent-foreground",
          icon: AlertTriangle,
        }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  }

  const statusConfig = getStatusConfig(transaction.status)
  const StatusIcon = statusConfig.icon
  const difference = transaction.totalReceived - transaction.saleValue

  return (
    <Card className={`mb-3 ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {!isReadOnly && <Checkbox checked={isSelected} onCheckedChange={onSelect} className="mt-1" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{transaction.orderNumber}</span>
                <Badge variant="outline" className="text-xs">
                  {transaction.company}
                </Badge>
              </div>
              <Badge className={`${statusConfig.className} text-xs`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
              {formatDate(transaction.saleDate)} • {transaction.client}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Valor: </span>
                <span className="font-medium">{formatCurrency(transaction.saleValue)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Recebido: </span>
                <span className="font-medium">{formatCurrency(transaction.totalReceived)}</span>
              </div>
            </div>

            {expanded && (
              <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Total NF: </span>
                    <span>{formatCurrency(transaction.invoiceTotal)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Diferença: </span>
                    <span className={difference >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(difference)}
                    </span>
                  </div>
                </div>
                {transaction.invoiceNumbers && (
                  <div>
                    <span className="text-muted-foreground">NF(s): </span>
                    <span>{transaction.invoiceNumbers}</span>
                  </div>
                )}
                {transaction.paymentMethod && (
                  <div>
                    <span className="text-muted-foreground">Forma Pgto: </span>
                    <span>{transaction.paymentMethod}</span>
                  </div>
                )}
                {transaction.observations && (
                  <div>
                    <span className="text-muted-foreground">Obs: </span>
                    <span>{transaction.observations}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-xs h-8 px-2">
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" /> Menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" /> Mais
                  </>
                )}
              </Button>

              {!isReadOnly && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TransactionsTable({
  transactions,
  onUpdateTransaction,
  onDeleteTransaction,
  onBulkDelete,
  isReadOnly = false,
}: TransactionsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [companyFilter, setCompanyFilter] = useState<string>("all")
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter
    const matchesCompany = companyFilter === "all" || t.company === companyFilter
    return matchesStatus && matchesCompany
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.size > 0) {
      onBulkDelete(Array.from(selectedIds))
      setSelectedIds(new Set())
      setShowDeleteConfirm(false)
    }
  }

  const isAllSelected = filteredTransactions.length > 0 && filteredTransactions.every((t) => selectedIds.has(t.id))
  const isSomeSelected = filteredTransactions.some((t) => selectedIds.has(t.id))

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
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">Filtrar por empresa:</label>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">Filtrar por status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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

        {!isReadOnly && selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Selecionados ({selectedIds.size})
          </Button>
        )}
      </div>

      <div className="block lg:hidden">
        {!isReadOnly && filteredTransactions.length > 0 && (
          <div className="flex items-center gap-2 mb-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Selecionar todos" />
            <span className="text-sm text-muted-foreground">
              {isAllSelected ? "Desmarcar todos" : "Selecionar todos"}
            </span>
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Nenhum lançamento encontrado</div>
        ) : (
          filteredTransactions.map((transaction) => (
            <MobileTransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={() => setEditingTransaction(transaction)}
              onDelete={() => onDeleteTransaction(transaction.id)}
              isReadOnly={isReadOnly}
              isSelected={selectedIds.has(transaction.id)}
              onSelect={(checked) => handleSelectOne(transaction.id, checked)}
            />
          ))
        )}
      </div>

      <div className="hidden lg:block rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {!isReadOnly && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todos"
                      className={isSomeSelected && !isAllSelected ? "data-[state=checked]:bg-primary/50" : ""}
                    />
                  </TableHead>
                )}
                <TableHead className="font-semibold">Pedido</TableHead>
                <TableHead className="font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Empresa</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold text-right">Valor Venda</TableHead>
                <TableHead className="font-semibold text-right">Total NF</TableHead>
                <TableHead className="font-semibold text-right">Total Recebido</TableHead>
                <TableHead className="font-semibold text-right">Diferença</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                {!isReadOnly && <TableHead className="font-semibold">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isReadOnly ? 10 : 11} className="text-center text-muted-foreground py-8">
                    Nenhum lançamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const statusConfig = getStatusConfig(transaction.status)
                  const StatusIcon = statusConfig.icon
                  const difference = transaction.totalReceived - transaction.saleValue
                  const isSelected = selectedIds.has(transaction.id)

                  return (
                    <TableRow key={transaction.id} className={`hover:bg-muted/30 ${isSelected ? "bg-primary/5" : ""}`}>
                      {!isReadOnly && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectOne(transaction.id, checked as boolean)}
                            aria-label={`Selecionar ${transaction.orderNumber}`}
                          />
                        </TableCell>
                      )}
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
                      {!isReadOnly && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTransaction(transaction)}
                              className="h-8 w-8 p-0"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteTransaction(transaction.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
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

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir <strong>{selectedIds.size}</strong> lançamento(s). Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir {selectedIds.size} lançamento(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
