"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionsTable } from "@/components/transactions-table"
import type { Transaction } from "@/app/page"

type TransactionsViewProps = {
  transactions: Transaction[]
  onAddTransaction: (transaction: Omit<Transaction, "id" | "status">) => void
  onUpdateTransaction: (id: string, transaction: Omit<Transaction, "id" | "status">) => void
}

export function TransactionsView({ transactions, onAddTransaction, onUpdateTransaction }: TransactionsViewProps) {
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
          <CardTitle className="text-xl font-bold">Histórico de Lançamentos</CardTitle>
          <CardDescription className="text-base">Visualize e filtre todas as operações cadastradas</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={transactions} onUpdateTransaction={onUpdateTransaction} />
          {/* </CHANGE> */}
        </CardContent>
      </Card>
    </div>
  )
}
