"use server"

import { getTransactions, createTransaction, updateTransaction, type Transaction } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    console.log("[v0] Fetching transactions from database...")
    const transactions = await getTransactions()
    console.log("[v0] Fetched transactions:", transactions.length)
    return transactions
  } catch (error) {
    console.error("[v0] Error in fetchTransactions:", error)
    return []
  }
}

export async function addTransaction(transaction: Omit<Transaction, "id" | "status">) {
  try {
    console.log("[v0] Adding transaction:", transaction)

    // Calculate status
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

    console.log("[v0] Calculated status:", status)
    const result = await createTransaction(transaction, status)
    console.log("[v0] Transaction created:", result)

    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error in addTransaction:", error)
    throw error
  }
}

export async function editTransaction(id: string, transaction: Omit<Transaction, "id" | "status">) {
  try {
    console.log("[v0] Editing transaction with id:", id)

    // Calculate status
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

    console.log("[v0] Calculated status:", status)
    const result = await updateTransaction(id, transaction, status)
    console.log("[v0] Transaction updated:", result)

    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error in editTransaction:", error)
    throw error
  }
}
