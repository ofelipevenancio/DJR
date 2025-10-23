"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, X, Calendar, Building2, User, FileText, DollarSign, CheckCircle2, AlertCircle } from "lucide-react"
import type { Transaction } from "@/app/page"
import { formatDate } from "@/lib/utils"

type PendentesViewProps = {
  transactions: Transaction[]
  onUpdateTransaction: (id: string, transaction: Omit<Transaction, "id" | "status">) => void
}

export function PendentesView({ transactions, onUpdateTransaction }: PendentesViewProps) {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    orderNumber: "",
    company: "",
    client: "",
    minValue: "",
    maxValue: "",
  })

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [bankAccount, setBankAccount] = useState("")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showDiscountDialog, setShowDiscountDialog] = useState(false)
  const [pendingPaymentData, setPendingPaymentData] = useState<{
    amount: number
    difference: number
  } | null>(null)

  const pendingTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (transaction.status !== "pending" && transaction.status !== "partial") return false

      if (filters.startDate && transaction.saleDate < filters.startDate) return false
      if (filters.endDate && transaction.saleDate > filters.endDate) return false
      if (filters.orderNumber && !transaction.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase()))
        return false
      if (filters.company && filters.company !== "all" && transaction.company !== filters.company) return false
      if (filters.client && !transaction.client.toLowerCase().includes(filters.client.toLowerCase())) return false
      if (filters.minValue && transaction.saleValue < Number.parseFloat(filters.minValue)) return false
      if (filters.maxValue && transaction.saleValue > Number.parseFloat(filters.maxValue)) return false

      return true
    })
  }, [transactions, filters])

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      orderNumber: "",
      company: "",
      client: "",
      minValue: "",
      maxValue: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "" && value !== "all")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    const statusConfig = {
      partial: { label: "Parcial", className: "bg-yellow-500 hover:bg-yellow-600" },
      pending: { label: "Pendente", className: "bg-red-500 hover:bg-red-600" },
    }

    const config = statusConfig[status as "partial" | "pending"]
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const handleOpenPaymentDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setPaymentAmount("")
    setPaymentMethod(transaction.paymentMethod || "")
    setBankAccount(transaction.bankAccount || "")
    setShowPaymentDialog(true)
  }

  const handleDiscountDecision = (applyDiscount: boolean) => {
    if (!selectedTransaction || !pendingPaymentData) return

    const newTotalReceived = selectedTransaction.totalReceived + pendingPaymentData.amount
    let newDiscount = selectedTransaction.discount || 0

    if (applyDiscount) {
      newDiscount += pendingPaymentData.difference
    }

    onUpdateTransaction(selectedTransaction.id, {
      ...selectedTransaction,
      totalReceived: newTotalReceived,
      discount: newDiscount,
      paymentMethod: paymentMethod || selectedTransaction.paymentMethod,
      bankAccount: bankAccount || selectedTransaction.bankAccount,
    })

    setShowDiscountDialog(false)
    setShowPaymentDialog(false)
    setSelectedTransaction(null)
    setPaymentAmount("")
    setPaymentMethod("")
    setBankAccount("")
    setPendingPaymentData(null)
  }

  const handleRecordPayment = () => {
    if (!selectedTransaction) return

    const amount = Number.parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Por favor, insira um valor válido para o pagamento.")
      return
    }

    const pendingAmount =
      selectedTransaction.saleValue - selectedTransaction.totalReceived - (selectedTransaction.discount || 0)

    if (amount > pendingAmount) {
      alert(`O valor do pagamento não pode ser maior que o valor pendente (${formatCurrency(pendingAmount)}).`)
      return
    }

    const difference = pendingAmount - amount

    if (difference > 0.01) {
      setPendingPaymentData({ amount, difference })
      setShowDiscountDialog(true)
      return
    }

    const confirmed = window.confirm(
      `Confirma o registro de pagamento de ${formatCurrency(amount)} para o pedido ${selectedTransaction.orderNumber}?`,
    )

    if (!confirmed) return

    const newTotalReceived = selectedTransaction.totalReceived + amount

    onUpdateTransaction(selectedTransaction.id, {
      ...selectedTransaction,
      totalReceived: newTotalReceived,
      paymentMethod: paymentMethod || selectedTransaction.paymentMethod,
      bankAccount: bankAccount || selectedTransaction.bankAccount,
    })

    setShowPaymentDialog(false)
    setSelectedTransaction(null)
    setPaymentAmount("")
    setPaymentMethod("")
    setBankAccount("")
  }

  const handleFullPayment = () => {
    if (!selectedTransaction) return

    const pendingAmount =
      selectedTransaction.saleValue - selectedTransaction.totalReceived - (selectedTransaction.discount || 0)
    setPaymentAmount(pendingAmount.toFixed(2))
  }

  const summary = useMemo(() => {
    const totalPending = pendingTransactions.reduce(
      (sum, t) => sum + (t.saleValue - t.totalReceived - (t.discount || 0)),
      0,
    )
    const totalPartiallyPaid = pendingTransactions
      .filter((t) => t.status === "partial")
      .reduce((sum, t) => sum + t.totalReceived, 0)
    const totalDiscount = pendingTransactions.reduce((sum, t) => sum + (t.discount || 0), 0)

    return {
      count: pendingTransactions.length,
      totalPending,
      totalPartiallyPaid,
      totalDiscount,
    }
  }, [pendingTransactions])

  return (
    <div className="space-y-8 py-2">
      <div className="border-b border-border pb-6">
        <h2 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Contas a Receber</h2>
        <p className="text-base text-muted-foreground">
          Gerencie e dê baixa em notas fiscais pendentes e parcialmente pagas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary.count}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total a Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(summary.totalPending)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parcialmente Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{formatCurrency(summary.totalPartiallyPaid)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Search className="w-5 h-5" />
                Filtros de Pesquisa
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Use os filtros abaixo para refinar sua pesquisa
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="gap-2 bg-transparent">
                <X className="w-4 h-4" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data Inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data Final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderNumber" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Nº do Pedido
              </Label>
              <Input
                id="orderNumber"
                placeholder="001"
                value={filters.orderNumber}
                onChange={(e) => setFilters({ ...filters, orderNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Empresa
              </Label>
              <Select value={filters.company} onValueChange={(value) => setFilters({ ...filters, company: value })}>
                <SelectTrigger id="company">
                  <SelectValue placeholder="Todas" />
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

            <div className="space-y-2">
              <Label htmlFor="client" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente
              </Label>
              <Input
                id="client"
                placeholder="Nome do cliente"
                value={filters.client}
                onChange={(e) => setFilters({ ...filters, client: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minValue" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor Mínimo
              </Label>
              <Input
                id="minValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.minValue}
                onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxValue" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor Máximo
              </Label>
              <Input
                id="maxValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.maxValue}
                onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Notas Pendentes</CardTitle>
          <CardDescription className="text-base mt-1">
            {pendingTransactions.length} nota(s) pendente(s) ou parcialmente paga(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Pedido</TableHead>
                  <TableHead className="font-bold">Data</TableHead>
                  <TableHead className="font-bold">Empresa</TableHead>
                  <TableHead className="font-bold">Cliente</TableHead>
                  <TableHead className="font-bold text-right">Valor Total</TableHead>
                  <TableHead className="font-bold text-right">Já Recebido</TableHead>
                  <TableHead className="font-bold text-right">Desconto</TableHead>
                  <TableHead className="font-bold text-right">A Receber</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                        <p className="font-medium">Nenhuma nota pendente encontrada</p>
                        <p className="text-sm">
                          Todas as notas estão quitadas ou não há registros com os filtros aplicados
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingTransactions.map((transaction) => {
                    const pendingAmount =
                      transaction.saleValue - transaction.totalReceived - (transaction.discount || 0)
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
                          {formatCurrency(transaction.saleValue)}
                        </TableCell>
                        <TableCell className="text-right text-yellow-600 font-medium">
                          {formatCurrency(transaction.totalReceived)}
                        </TableCell>
                        <TableCell className="text-right text-blue-600 font-medium">
                          {transaction.discount && transaction.discount > 0
                            ? formatCurrency(transaction.discount)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-bold">
                          {formatCurrency(pendingAmount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => handleOpenPaymentDialog(transaction)} className="gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Dar Baixa
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Registrar Pagamento
            </DialogTitle>
            <DialogDescription>
              Registre o pagamento recebido para o pedido {selectedTransaction?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{selectedTransaction.client}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor Total:</span>
                  <span className="font-medium">{formatCurrency(selectedTransaction.saleValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Já Recebido:</span>
                  <span className="font-medium text-yellow-600">
                    {formatCurrency(selectedTransaction.totalReceived)}
                  </span>
                </div>
                {selectedTransaction.discount && selectedTransaction.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto Concedido:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(selectedTransaction.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-border pt-2">
                  <span className="text-muted-foreground font-medium">Valor Pendente:</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(
                      selectedTransaction.saleValue -
                        selectedTransaction.totalReceived -
                        (selectedTransaction.discount || 0),
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Valor do Pagamento *</Label>
                <div className="flex gap-2">
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleFullPayment}>
                    Quitação Total
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethodDialog">Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethodDialog">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountDialog">Conta Bancária</Label>
                <Select value={bankAccount} onValueChange={setBankAccount}>
                  <SelectTrigger id="bankAccountDialog">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sicoob Aracoop - Ag. 4264 - C/C 66433-2">
                      Sicoob Aracoop - Ag. 4264 - C/C 66433-2
                    </SelectItem>
                    <SelectItem value="Sicoob Aracredi - Ag. 3093 - C/C 6610-9">
                      Sicoob Aracredi - Ag. 3093 - C/C 6610-9
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-900 dark:text-blue-100">
                  O pagamento será registrado e o status da nota será atualizado automaticamente.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRecordPayment}>Confirmar Pagamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Pagamento Parcial Detectado
            </DialogTitle>
            <DialogDescription>
              O valor do pagamento é menor que o valor pendente. Como deseja tratar a diferença?
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && pendingPaymentData && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor Pendente:</span>
                  <span className="font-bold">
                    {formatCurrency(
                      selectedTransaction.saleValue -
                        selectedTransaction.totalReceived -
                        (selectedTransaction.discount || 0),
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor do Pagamento:</span>
                  <span className="font-medium text-green-600">{formatCurrency(pendingPaymentData.amount)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2">
                  <span className="text-muted-foreground font-medium">Diferença:</span>
                  <span className="font-bold text-red-600">{formatCurrency(pendingPaymentData.difference)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Como deseja tratar essa diferença?</p>

                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 bg-transparent"
                  onClick={() => handleDiscountDecision(false)}
                >
                  <div className="text-left">
                    <div className="font-semibold">Manter como Pendente</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      A diferença de {formatCurrency(pendingPaymentData.difference)} continuará pendente para
                      recebimento futuro
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20 bg-transparent"
                  onClick={() => handleDiscountDecision(true)}
                >
                  <div className="text-left">
                    <div className="font-semibold text-blue-600">Aplicar como Desconto</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      A diferença de {formatCurrency(pendingPaymentData.difference)} será registrada como desconto
                      concedido
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDiscountDialog(false)
                setPendingPaymentData(null)
              }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
