"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionsTable } from "@/components/transactions-table"
import type { Transaction } from "@/app/page"
import { useState } from "react"

type TransactionsViewProps = {
  transactions: Transaction[]
  onAddTransaction: (transaction: Omit<Transaction, "id" | "status">) => void
  onUpdateTransaction: (id: string, transaction: Omit<Transaction, "id" | "status">) => void
  onDeleteTransaction: (id: string) => void
  onBulkImport: (transactions: Omit<Transaction, "id" | "status">[]) => void
}

export function TransactionsView({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onBulkImport,
}: TransactionsViewProps) {
  const [importing, setImporting] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      // Skip header row
      const dataLines = lines.slice(1)

      const importedTransactions: Omit<Transaction, "id" | "status">[] = []

      for (const line of dataLines) {
        // Parse CSV line (handle commas inside quotes)
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map((v) => v.replace(/^"|"$/g, "").trim()) || []

        if (values.length < 6) continue // Skip invalid lines

        const [
          pedido,
          data,
          empresa,
          cliente,
          valor_vendido,
          nf,
          total_nf,
          total_recebido,
          forma_recebimento,
          banco_conta,
          observacoes,
        ] = values

        importedTransactions.push({
          orderNumber: pedido || "",
          saleDate: data || "",
          company: empresa || "",
          client: cliente || "",
          saleValue: valor_vendido ? Number.parseFloat(valor_vendido) : 0,
          invoiceNumbers: nf || "",
          invoiceTotal: total_nf ? Number.parseFloat(total_nf) : 0,
          totalReceived: total_recebido ? Number.parseFloat(total_recebido) : 0,
          paymentMethod: forma_recebimento || "",
          bankAccount: banco_conta || "",
          observations: observacoes || "",
        })
      }

      if (importedTransactions.length > 0) {
        onBulkImport(importedTransactions)
        alert(`${importedTransactions.length} lançamentos importados com sucesso!`)
      } else {
        alert("Nenhum lançamento válido encontrado no arquivo.")
      }
    } catch (error) {
      console.error("[v0] Erro ao importar CSV:", error)
      alert("Erro ao importar arquivo. Verifique o formato do CSV.")
    } finally {
      setImporting(false)
      event.target.value = "" // Reset input
    }
  }

  return (
    <div className="space-y-8 py-2">
      <div className="border-b border-border pb-6">
        <h2 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Lançamentos</h2>
        <p className="text-base text-muted-foreground">
          Cadastre e visualize todas as operações de venda e recebimento
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Novo Lançamento</CardTitle>
          <CardDescription className="text-base">Preencha os dados da operação de venda</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm onSubmit={onAddTransaction} />
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Histórico de Lançamentos</CardTitle>
              <CardDescription className="text-base">Visualize e filtre todas as operações cadastradas</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = "/template-importacao.csv"
                  link.download = "template-importacao.csv"
                  link.click()
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Template
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={importing}
                onClick={() => document.getElementById("csv-upload")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? "Importando..." : "Importar CSV"}
              </Button>
              <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={transactions}
            onUpdateTransaction={onUpdateTransaction}
            onDeleteTransaction={onDeleteTransaction}
          />
        </CardContent>
      </Card>
    </div>
  )
}
