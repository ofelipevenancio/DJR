"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, AlertCircle, Clock, Percent, Building2 } from "lucide-react"
import { SalesChart } from "@/components/sales-chart"
import { StatusPieChart } from "@/components/status-pie-chart"
import { TimelineChart } from "@/components/timeline-chart"
import type { Transaction } from "@/app/page"

type DashboardViewProps = {
  transactions: Transaction[]
}

export function DashboardView({ transactions }: DashboardViewProps) {
  const [companyFilter, setCompanyFilter] = useState<string>("all")

  const filteredTransactions =
    companyFilter === "all" ? transactions : transactions.filter((t) => t.company === companyFilter)

  const totalSold = filteredTransactions.reduce((sum, t) => sum + t.saleValue, 0)
  const totalReceived = filteredTransactions.reduce((sum, t) => sum + t.totalReceived, 0)
  const totalPending = totalSold - totalReceived
  const receivedPercentage = totalSold > 0 ? (totalReceived / totalSold) * 100 : 0

  const partialCount = filteredTransactions.filter((t) => t.status === "partial").length
  const pendingCount = filteredTransactions.filter((t) => t.status === "pending").length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-8 py-2">
      <div className="border-b border-border pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Dashboard</h2>
            <p className="text-base text-muted-foreground">Visão geral e análise financeira das operações</p>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Empresas</SelectItem>
                <SelectItem value="Klabin">Klabin</SelectItem>
                <SelectItem value="Jaepel">Jaepel</SelectItem>
                <SelectItem value="Fernandez">Fernandez</SelectItem>
                <SelectItem value="Vale Tambau">Vale Tambau</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Total Vendido
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">{formatCurrency(totalSold)}</div>
            <p className="text-sm text-muted-foreground mt-2">{filteredTransactions.length} operações registradas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-received shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Total Recebido
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-status-received/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-status-received" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">{formatCurrency(totalReceived)}</div>
            <p className="text-sm text-muted-foreground mt-2">Pagamentos confirmados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-pending shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Total em Aberto
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-status-pending/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-status-pending" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">{formatCurrency(totalPending)}</div>
            <p className="text-sm text-muted-foreground mt-2">Aguardando recebimento</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                % de Recebimento
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">{receivedPercentage.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground mt-2">Taxa de conversão</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-partial shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Vendas Parciais
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-status-partial/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-status-partial" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">{partialCount}</div>
            <p className="text-sm text-muted-foreground mt-2">Pagamentos incompletos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-pending shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Vendas Pendentes
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-status-pending/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-status-pending" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">{pendingCount}</div>
            <p className="text-sm text-muted-foreground mt-2">Sem pagamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Vendido vs Recebido</CardTitle>
            <CardDescription className="text-base">Comparação por pedido</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart transactions={filteredTransactions} />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Distribuição de Status</CardTitle>
            <CardDescription className="text-base">Situação das operações</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusPieChart transactions={filteredTransactions} />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Evolução dos Recebimentos</CardTitle>
          <CardDescription className="text-base">Linha temporal mensal</CardDescription>
        </CardHeader>
        <CardContent>
          <TimelineChart transactions={filteredTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
