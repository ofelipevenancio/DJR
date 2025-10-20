"use server"

import { getTransactions, createTransaction, updateTransaction, type Transaction } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function fetchTransactions(): Promise<Transaction[]> {
  return await getTransactions()
}

export async function addTransaction(transaction: Omit<Transaction, "id" | "status">) {
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

  const result = await createTransaction(transaction, status)
  revalidatePath("/")
  return result
}

export async function editTransaction(id: string, transaction: Omit<Transaction, "id" | "status">) {
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

  const result = await updateTransaction(id, transaction, status)
  revalidatePath("/")
  return result
}
