"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TransactionsView } from "@/components/transactions-view"
import { PendentesView } from "@/components/pendentes-view"
import { DashboardView } from "@/components/dashboard-view"
import { ReportsView } from "@/components/reports-view"
import { SettingsView } from "@/components/settings-view"
import { LoginScreen } from "@/components/login-screen"
import type { User } from "@/lib/auth"
import {
  fetchTransactions,
  addTransaction as addTransactionAction,
  editTransaction as editTransactionAction,
  deleteTransaction as deleteTransactionAction,
  bulkDeleteTransactions as bulkDeleteAction,
  bulkImportTransactions as bulkImportAction,
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
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"transactions" | "pendentes" | "dashboard" | "reports" | "settings">(
    "transactions",
  )
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  useEffect(() => {
    const authStatus = localStorage.getItem("djr_auth")
    const userDataStr = localStorage.getItem("djr_user_data")
    if (authStatus === "true" && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr)
        setCurrentUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("[v0] Error parsing user data:", error)
        localStorage.removeItem("djr_auth")
        localStorage.removeItem("djr_user_data")
      }
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

  const handleLogin = (user: User) => {
    localStorage.setItem("djr_auth", "true")
    localStorage.setItem("djr_user_data", JSON.stringify(user))
    setCurrentUser(user)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("djr_auth")
    localStorage.removeItem("djr_user_data")
    setCurrentUser(null)
    setIsAuthenticated(false)
    setCurrentView("transactions")
    setTransactions([])
  }

  const isReadOnly = currentUser?.role === "readonly"

  const addTransaction = async (transaction: Omit<Transaction, "id" | "status">) => {
    if (isReadOnly) {
      alert("Você não tem permissão para adicionar lançamentos.")
      return
    }

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
    if (isReadOnly) {
      alert("Você não tem permissão para editar lançamentos.")
      return
    }

    try {
      const result = await editTransactionAction(id, transaction)
      if (result) {
        await loadTransactions()
      }
    } catch (error) {
      console.error("[v0] Error updating transaction:", error)
    }
  }

  const deleteTransaction = async (id: string) => {
    if (isReadOnly) {
      alert("Você não tem permissão para excluir lançamentos.")
      return
    }

    try {
      const confirmed = confirm("Tem certeza que deseja excluir este lançamento?")
      if (!confirmed) return

      const result = await deleteTransactionAction(id)
      if (result) {
        await loadTransactions()
      } else {
        alert("Erro ao excluir lançamento")
      }
    } catch (error) {
      console.error("[v0] Error deleting transaction:", error)
      alert("Erro ao excluir lançamento")
    }
  }

  const bulkImportTransactions = async (transactionsToImport: Omit<Transaction, "id" | "status">[]) => {
    if (isReadOnly) {
      alert("Você não tem permissão para importar lançamentos.")
      return
    }

    try {
      console.log("[v0] Client: Bulk importing", transactionsToImport.length, "transactions")

      const result = await bulkImportAction(transactionsToImport)

      console.log("[v0] Client: Import result:", result)
      await loadTransactions()

      if (result.errorCount > 0) {
        const errorDetails = result.errors.length > 0 ? `\n\nPrimeiros erros:\n${result.errors.join("\n")}` : ""
        alert(`Importação concluída: ${result.successCount} sucesso, ${result.errorCount} erros${errorDetails}`)
      } else {
        alert(`Importação concluída com sucesso: ${result.successCount} lançamentos importados!`)
      }
    } catch (error) {
      console.error("[v0] Client: Error in bulk import:", error)
      alert(`Erro ao importar lançamentos: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    }
  }

  const bulkDeleteTransactions = async (ids: string[]) => {
    if (isReadOnly) {
      alert("Você não tem permissão para excluir lançamentos.")
      return
    }

    try {
      console.log("[v0] Bulk deleting", ids.length, "transactions")
      const result = await bulkDeleteAction(ids)
      if (result.success) {
        console.log("[v0] Bulk delete complete:", result.deleted, "deleted")
        await loadTransactions()
      }
    } catch (error) {
      console.error("[v0] Error in bulk delete:", error)
      alert("Erro ao excluir lançamentos em massa")
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
      <Header currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} user={currentUser} />
      <main className="flex-1 pt-16 lg:pt-20 pb-6 lg:pb-10 px-3 lg:px-6">
        <div className="container mx-auto max-w-7xl py-4 lg:py-10">
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
              onDeleteTransaction={deleteTransaction}
              onBulkImport={bulkImportTransactions}
              onBulkDelete={bulkDeleteTransactions}
              isReadOnly={isReadOnly}
            />
          ) : currentView === "pendentes" ? (
            <PendentesView
              transactions={transactions}
              onUpdateTransaction={updateTransaction}
              isReadOnly={isReadOnly}
            />
          ) : currentView === "dashboard" ? (
            <DashboardView transactions={transactions} />
          ) : currentView === "reports" ? (
            <ReportsView transactions={transactions} />
          ) : currentView === "settings" && !isReadOnly ? (
            <SettingsView />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
