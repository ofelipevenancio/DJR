"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, X, Download, Calendar, Building2, User, FileText, DollarSign } from "lucide-react"
import type { Transaction } from "@/app/page"

type ReportsViewProps = {
  transactions: Transaction[]
}

export function ReportsView({ transactions }: ReportsViewProps) {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    orderNumber: "",
    company: "",
    client: "",
    minValue: "",
    maxValue: "",
    status: "",
  })

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filter by date range
      if (filters.startDate && transaction.saleDate < filters.startDate) return false
      if (filters.endDate && transaction.saleDate > filters.endDate) return false

      // Filter by order number
      if (filters.orderNumber && !transaction.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase()))
        return false

      // Filter by company
      if (filters.company && filters.company !== "all" && transaction.company !== filters.company) return false

      // Filter by client
      if (filters.client && !transaction.client.toLowerCase().includes(filters.client.toLowerCase())) return false

      // Filter by value range
      if (filters.minValue && transaction.saleValue < Number.parseFloat(filters.minValue)) return false
      if (filters.maxValue && transaction.saleValue > Number.parseFloat(filters.maxValue)) return false

      // Filter by status
      if (filters.status && filters.status !== "all" && transaction.status !== filters.status) return false

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
      status: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "" && value !== "all")

  const getStatusBadge = (status: Transaction["status"]) => {
    const statusConfig = {
      received: { label: "Recebido", variant: "default" as const, className: "bg-green-500 hover:bg-green-600" },
      partial: { label: "Parcial", variant: "secondary" as const, className: "bg-yellow-500 hover:bg-yellow-600" },
      pending: { label: "Pendente", variant: "secondary" as const, className: "bg-red-500 hover:bg-red-600" },
      divergent: {
        label: "Divergente",
        variant: "destructive" as const,
        className: "bg-orange-500 hover:bg-orange-600",
      },
    }

    const config = statusConfig[status]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR")
  }

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.saleValue, 0)
    const totalReceived = filteredTransactions.reduce((sum, t) => sum + t.totalReceived, 0)
    const totalPending = filteredTransactions
      .filter((t) => t.status === "pending" || t.status === "partial")
      .reduce((sum, t) => sum + (t.saleValue - t.totalReceived), 0)

    return {
      count: filteredTransactions.length,
      totalSales,
      totalReceived,
      totalPending,
    }
  }, [filteredTransactions])

  const exportToCSV = () => {
    const headers = [
      "Pedido",
      "Data",
      "Empresa",
      "Cliente",
      "Valor Venda",
      "NF",
      "Total NF",
      "Recebido",
      "Forma Pgto",
      "Status",
      "Observações",
    ]

    const rows = filteredTransactions.map((t) => [
      t.orderNumber,
      formatDate(t.saleDate),
      t.company,
      t.client,
      t.saleValue.toFixed(2),
      t.invoiceNumbers,
      t.invoiceTotal.toFixed(2),
      t.totalReceived.toFixed(2),
      t.paymentMethod,
      t.status,
      t.observations,
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `relatorio-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8 py-2">
      <div className="border-b border-border pb-6">
        <h2 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Relatórios</h2>
        <p className="text-base text-muted-foreground">Pesquise e analise os lançamentos com filtros avançados</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary.count}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total em Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatCurrency(summary.totalSales)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(summary.totalReceived)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(summary.totalPending)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
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
            {/* Date Range */}
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

            {/* Order Number */}
            <div className="space-y-2">
              <Label htmlFor="orderNumber" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Nº do Pedido
              </Label>
              <Input
                id="orderNumber"
                placeholder="PED-001"
                value={filters.orderNumber}
                onChange={(e) => setFilters({ ...filters, orderNumber: e.target.value })}
              />
            </div>

            {/* Company */}
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

            {/* Client */}
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

            {/* Value Range */}
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

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos" />
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
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Resultados da Pesquisa</CardTitle>
              <CardDescription className="text-base mt-1">
                {filteredTransactions.length} registro(s) encontrado(s)
              </CardDescription>
            </div>
            <Button onClick={exportToCSV} className="gap-2" disabled={filteredTransactions.length === 0}>
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
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
                  <TableHead className="font-bold text-right">Valor Venda</TableHead>
                  <TableHead className="font-bold">NF(s)</TableHead>
                  <TableHead className="font-bold text-right">Total NF</TableHead>
                  <TableHead className="font-bold text-right">Recebido</TableHead>
                  <TableHead className="font-bold">Forma Pgto</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      Nenhum registro encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{transaction.orderNumber}</TableCell>
                      <TableCell>{formatDate(transaction.saleDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {transaction.company}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.client}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(transaction.saleValue)}</TableCell>
                      <TableCell className="font-mono text-sm">{transaction.invoiceNumbers}</TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.invoiceTotal)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.totalReceived)}
                      </TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="max-w-xs truncate" title={transaction.observations}>
                        {transaction.observations}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
