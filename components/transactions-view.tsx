"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Download, Upload, ClipboardPaste } from "lucide-react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionsTable } from "@/components/transactions-table"
import type { Transaction } from "@/app/page"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

type TransactionsViewProps = {
  transactions: Transaction[]
  onAddTransaction: (transaction: Omit<Transaction, "id" | "status">) => void
  onUpdateTransaction: (id: string, transaction: Omit<Transaction, "id" | "status">) => void
  onDeleteTransaction: (id: string) => void
  onBulkImport: (transactions: Omit<Transaction, "id" | "status">[]) => void
  onBulkDelete: (ids: string[]) => void
  isReadOnly?: boolean
}

export function TransactionsView({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onBulkImport,
  onBulkDelete,
  isReadOnly = false,
}: TransactionsViewProps) {
  const [importing, setImporting] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [pasteData, setPasteData] = useState("")
  const [importPreview, setImportPreview] = useState<Omit<Transaction, "id" | "status">[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  const parseNumber = (val: string) => {
    if (!val) return 0
    const cleaned = val
      .replace(/[R$\s]/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
    return Number.parseFloat(cleaned) || 0
  }

  const parseDate = (dateStr: string): string => {
    if (!dateStr) return ""

    const cleanDate = dateStr.trim()

    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return cleanDate
    }

    // DD/MM/YYYY format
    const brFormat = cleanDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (brFormat) {
      const [, day, month, year] = brFormat
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }

    // DD/MM/YY format
    const shortFormat = cleanDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)
    if (shortFormat) {
      const [, day, month, year] = shortFormat
      const fullYear = Number.parseInt(year) > 50 ? `19${year}` : `20${year}`
      return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }

    return cleanDate
  }

  const parsePastedData = (text: string): Omit<Transaction, "id" | "status">[] => {
    setImportError(null)
    setImportSuccess(null)

    const lines = text.split("\n").filter((line) => line.trim())

    const transactions: Omit<Transaction, "id" | "status">[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      let values: string[]
      if (line.includes("\t")) {
        values = line.split("\t")
      } else if (line.includes(";")) {
        values = line.split(";")
      } else {
        values = line.split(",")
      }

      if (values.length < 4) continue

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
      ] = values.map((v) => v?.trim().replace(/^"|"$/g, "") || "")

      transactions.push({
        orderNumber: pedido || "",
        saleDate: parseDate(data),
        company: empresa || "",
        client: cliente || "",
        saleValue: parseNumber(valor_vendido),
        invoiceNumbers: nf || "",
        invoiceTotal: parseNumber(total_nf),
        totalReceived: parseNumber(total_recebido),
        paymentMethod: forma_recebimento || "",
        bankAccount: banco_conta || "",
        observations: observacoes || "",
      })
    }

    return transactions
  }

  const handlePastePreview = () => {
    setImportError(null)
    setImportSuccess(null)

    if (!pasteData.trim()) {
      setImportError("Cole os dados do Excel antes de visualizar.")
      return
    }

    const parsed = parsePastedData(pasteData)

    if (parsed.length === 0) {
      setImportError("Nenhum dado válido encontrado. Verifique se os dados estão no formato correto.")
    } else {
      setImportSuccess(`${parsed.length} lançamento(s) encontrado(s) e pronto(s) para importar.`)
    }

    setImportPreview(parsed)
  }

  const handleConfirmImport = async () => {
    if (importPreview.length > 0) {
      setImportError(null)
      setImportSuccess(null)

      try {
        setImportSuccess(`Importando ${importPreview.length} lançamentos...`)
        await onBulkImport(importPreview)

        setTimeout(() => {
          setShowImportDialog(false)
          setPasteData("")
          setImportPreview([])
          setImportError(null)
          setImportSuccess(null)
        }, 500)
      } catch (error) {
        console.error("[v0] Error importing:", error)
        setImportError(`Erro ao importar: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) {
      alert("Você não tem permissão para importar lançamentos.")
      return
    }

    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      const dataLines = lines.slice(1)

      const importedTransactions: Omit<Transaction, "id" | "status">[] = []

      for (const line of dataLines) {
        let values: string[]
        if (line.includes(";")) {
          values = line.split(";").map((v) => v.replace(/^"|"$/g, "").trim())
        } else {
          values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map((v) => v.replace(/^"|"$/g, "").trim()) || []
        }

        if (values.length < 4) continue

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
          saleDate: parseDate(data),
          company: empresa || "",
          client: cliente || "",
          saleValue: parseNumber(valor_vendido),
          invoiceNumbers: nf || "",
          invoiceTotal: parseNumber(total_nf),
          totalReceived: parseNumber(total_recebido),
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
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8 py-2">
      <div className="border-b border-border pb-4 lg:pb-6">
        <h2 className="text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-3 tracking-tight">Lançamentos</h2>
        <p className="text-sm lg:text-base text-muted-foreground">
          Cadastre e visualize todas as operações de venda e recebimento
        </p>
      </div>

      {!isReadOnly && (
        <Card className="shadow-md">
          <CardHeader className="pb-4 lg:pb-6">
            <CardTitle className="text-lg lg:text-xl font-bold">Novo Lançamento</CardTitle>
            <CardDescription className="text-sm lg:text-base">Preencha os dados da operação de venda</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm onSubmit={onAddTransaction} />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md">
        <CardHeader className="pb-4 lg:pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl font-bold">Histórico de Lançamentos</CardTitle>
              <CardDescription className="text-sm lg:text-base">
                Visualize e filtre todas as operações cadastradas
              </CardDescription>
            </div>
            {!isReadOnly && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto bg-transparent"
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
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto bg-transparent"
                  onClick={() => setShowImportDialog(true)}
                >
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                  Colar do Excel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={importing}
                  onClick={() => document.getElementById("csv-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {importing ? "Importando..." : "Importar CSV"}
                </Button>
                <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <TransactionsTable
            transactions={transactions}
            onUpdateTransaction={onUpdateTransaction}
            onDeleteTransaction={onDeleteTransaction}
            onBulkDelete={onBulkDelete}
            isReadOnly={isReadOnly}
          />
        </CardContent>
      </Card>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Lançamentos</DialogTitle>
            <DialogDescription>
              Cole os dados diretamente do Excel ou Google Sheets. Cada linha será um lançamento.
            </DialogDescription>
          </DialogHeader>

          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}

          {importSuccess && (
            <Alert className="border-green-500 bg-green-50 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{importSuccess}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="paste" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">Colar Dados</TabsTrigger>
              <TabsTrigger value="instructions">Instruções</TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paste-area">Dados (copie do Excel e cole aqui)</Label>
                <Textarea
                  id="paste-area"
                  placeholder={`Cole aqui os dados copiados do Excel ou Google Sheets...

Formato: Pedido | Data | Empresa | Cliente | Valor Vendido | NF | Total NF | Recebido | Forma Pgto | Banco | Obs

Exemplo (copie as linhas abaixo para testar):
001	15/01/2025	Klabin	Cliente A	1500,00	NF-001	1500,00	1500,00	PIX	Sicoob Aracoop	
002	16/01/2025	Jaepel	Cliente B	2000,00	NF-002	2000,00	0	Boleto		Aguardando`}
                  className="min-h-[150px] lg:min-h-[200px] font-mono text-sm"
                  value={pasteData}
                  onChange={(e) => {
                    setPasteData(e.target.value)
                    setImportError(null)
                    setImportSuccess(null)
                    setImportPreview([])
                  }}
                />
              </div>

              <Button onClick={handlePastePreview} variant="outline" className="w-full bg-transparent">
                Visualizar Dados
              </Button>

              {importPreview.length > 0 && (
                <div className="border rounded-lg p-3 lg:p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Prévia: {importPreview.length} lançamento(s) encontrado(s)</h4>
                  <div className="max-h-[150px] lg:max-h-[200px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Pedido</th>
                          <th className="p-2 text-left hidden sm:table-cell">Data</th>
                          <th className="p-2 text-left">Empresa</th>
                          <th className="p-2 text-left hidden sm:table-cell">Cliente</th>
                          <th className="p-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.slice(0, 10).map((t, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">{t.orderNumber}</td>
                            <td className="p-2 hidden sm:table-cell">{t.saleDate}</td>
                            <td className="p-2">{t.company}</td>
                            <td className="p-2 hidden sm:table-cell">{t.client}</td>
                            <td className="p-2 text-right">
                              {t.saleValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.length > 10 && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        ... e mais {importPreview.length - 10} lançamento(s)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4">
              <div className="bg-muted rounded-lg p-3 lg:p-4 space-y-3">
                <h4 className="font-semibold text-sm lg:text-base">Formato esperado das colunas:</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs lg:text-sm">
                  <li>
                    <strong>Nº Pedido</strong> - Número do pedido
                  </li>
                  <li>
                    <strong>Data</strong> - Data da venda (DD/MM/YYYY)
                  </li>
                  <li>
                    <strong>Empresa</strong> - Nome da empresa
                  </li>
                  <li>
                    <strong>Cliente</strong> - Nome do cliente
                  </li>
                  <li>
                    <strong>Valor Vendido</strong> - Valor da venda
                  </li>
                  <li>
                    <strong>Nº NF(s)</strong> - Números das notas fiscais
                  </li>
                  <li>
                    <strong>Total NF</strong> - Total das notas fiscais
                  </li>
                  <li>
                    <strong>Total Recebido</strong> - Valor já recebido
                  </li>
                  <li>
                    <strong>Forma Recebimento</strong> - Forma de pagamento
                  </li>
                  <li>
                    <strong>Banco/Conta</strong> - Conta bancária
                  </li>
                  <li>
                    <strong>Observações</strong> - Observações adicionais
                  </li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-transparent"
              onClick={() => {
                setShowImportDialog(false)
                setPasteData("")
                setImportPreview([])
                setImportError(null)
                setImportSuccess(null)
              }}
            >
              Cancelar
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleConfirmImport} disabled={importPreview.length === 0}>
              Importar {importPreview.length > 0 ? `(${importPreview.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
