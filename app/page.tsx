"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TransactionsView } from "@/components/transactions-view"
import { PendentesView } from "@/components/pendentes-view"
import { DashboardView } from "@/components/dashboard-view"
import { ReportsView } from "@/components/reports-view"
import { LoginScreen } from "@/components/login-screen"
import {
  fetchTransactions,
  addTransaction as addTransactionAction,
  editTransaction as editTransactionAction,
} from "./actions"

export type Transaction = {
  id: string
  orderNumber: string
  saleDate: string
  company: string
  client: string
  saleValue: number
  invoiceNumbers: string
  invoiceTotal: number
  totalReceived: number
  paymentMethod: string
  bankAccount: string
  observations: string
  status: "received" | "partial" | "pending" | "divergent"
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"transactions" | "pendentes" | "dashboard" | "reports">("transactions")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  useEffect(() => {
    const authStatus = localStorage.getItem("djr_auth")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions()
    }
  }, [isAuthenticated])

  const loadTransactions = async () => {
    setIsLoadingTransactions(true)
    try {
      const data = await fetchTransactions()
      setTransactions(data)
      console.log("[v0] Loaded transactions from database:", data.length, "transactions")
    } catch (error) {
      console.error("[v0] Error loading transactions:", error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const handleLogin = (email: string, password: string) => {
    localStorage.setItem("djr_auth", "true")
    localStorage.setItem("djr_user_email", email)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("djr_auth")
    localStorage.removeItem("djr_user_email")
    setIsAuthenticated(false)
    setCurrentView("transactions")
    setTransactions([])
  }

  const addTransaction = async (transaction: Omit<Transaction, "id" | "status">) => {
    try {
      console.log("[v0] Adding transaction:", transaction)
      const result = await addTransactionAction(transaction)
      console.log("[v0] Add transaction result:", result)
      if (result) {
        console.log("[v0] Reloading transactions from database...")
        await loadTransactions()
      } else {
        alert("Erro ao adicionar lançamento. Verifique o console para mais detalhes.")
      }
    } catch (error) {
      console.error("[v0] Error adding transaction:", error)
      alert(`Erro ao adicionar lançamento: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    }
  }

  const updateTransaction = async (id: string, transaction: Omit<Transaction, "id" | "status">) => {
    try {
      const result = await editTransactionAction(id, transaction)
      if (result) {
        await loadTransactions() // Reload from database
      }
    } catch (error) {
      console.error("[v0] Error updating transaction:", error)
    }
  }

  const bulkImportTransactions = async (transactions: Omit<Transaction, "id" | "status">[]) => {
    try {
      console.log("[v0] Bulk importing", transactions.length, "transactions")
      let successCount = 0
      let errorCount = 0

      for (const transaction of transactions) {
        try {
          const result = await addTransactionAction(transaction)
          if (result) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          console.error("[v0] Error importing transaction:", error)
          errorCount++
        }
      }

      console.log("[v0] Import complete:", successCount, "success,", errorCount, "errors")
      await loadTransactions()

      if (errorCount > 0) {
        alert(`Importação concluída: ${successCount} sucesso, ${errorCount} erros`)
      }
    } catch (error) {
      console.error("[v0] Error in bulk import:", error)
      alert("Erro ao importar lançamentos em massa")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
      <main className="flex-1 pt-20 pb-10 px-6">
        <div className="container mx-auto max-w-7xl py-10">
          {isLoadingTransactions ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando transações...</p>
            </div>
          ) : currentView === "transactions" ? (
            <TransactionsView
              transactions={transactions}
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
              onBulkImport={bulkImportTransactions}
            />
          ) : currentView === "pendentes" ? (
            <PendentesView transactions={transactions} onUpdateTransaction={updateTransaction} />
          ) : currentView === "dashboard" ? (
            <DashboardView transactions={transactions} />
          ) : (
            <ReportsView transactions={transactions} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
