"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TransactionsView } from "@/components/transactions-view"
import { PendentesView } from "@/components/pendentes-view"
import { DashboardView } from "@/components/dashboard-view"
import { ReportsView } from "@/components/reports-view"
import { LoginScreen } from "@/components/login-screen"

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

  useEffect(() => {
    const authStatus = localStorage.getItem("djr_auth")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

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
  }

  const [currentView, setCurrentView] = useState<"transactions" | "pendentes" | "dashboard" | "reports">("transactions")
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const addTransaction = (transaction: Omit<Transaction, "id" | "status">) => {
    const saleValue = transaction.saleValue
    const totalReceived = transaction.totalReceived

    let status: Transaction["status"]

    if (saleValue === 0 && totalReceived === 0) {
      status = "pending"
    } else if (totalReceived === saleValue && saleValue > 0) {
      status = "received"
    } else if (totalReceived > 0 && totalReceived < saleValue) {
      status = "partial"
    } else if (totalReceived === 0 && saleValue > 0) {
      status = "pending"
    } else {
      status = "divergent"
    }

    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      status,
    }

    setTransactions([newTransaction, ...transactions])
  }

  const updateTransaction = (id: string, transaction: Omit<Transaction, "id" | "status">) => {
    const saleValue = transaction.saleValue
    const totalReceived = transaction.totalReceived

    let status: Transaction["status"]

    if (saleValue === 0 && totalReceived === 0) {
      status = "pending"
    } else if (totalReceived === saleValue && saleValue > 0) {
      status = "received"
    } else if (totalReceived > 0 && totalReceived < saleValue) {
      status = "partial"
    } else if (totalReceived === 0 && saleValue > 0) {
      status = "pending"
    } else {
      status = "divergent"
    }

    setTransactions(
      transactions.map((t) =>
        t.id === id
          ? {
              ...transaction,
              id,
              status,
            }
          : t,
      ),
    )
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
          {currentView === "transactions" ? (
            <TransactionsView
              transactions={transactions}
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
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
