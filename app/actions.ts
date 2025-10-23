"use server"

import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction as deleteTransactionDb,
  type Transaction,
} from "@/lib/db"
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

export async function bulkImportKlabinData(tsvData: string) {
  try {
    console.log("[v0] Starting bulk import of Klabin data...")

    const lines = tsvData.trim().split("\n")
    const dataLines = lines.slice(1) // Skip header

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const line of dataLines) {
      try {
        const columns = line.split("\t")

        if (columns.length < 6) {
          console.log("[v0] Skipping invalid line:", line)
          continue
        }

        // Parse columns
        const dataEmissao = columns[0].trim() // DD/MM/YYYY
        const notaFiscal = columns[1].trim()
        const numeroDocumento = columns[2].trim()
        const observacao = columns[3].trim()
        const valorBruto = columns[4].trim()
        const valorRecebido = columns[5].trim()

        // Convert date from DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = dataEmissao.split("/")
        const saleDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`

        // Convert Brazilian currency format to number
        const parseCurrency = (value: string): number => {
          return Number.parseFloat(value.replace(/\./g, "").replace(",", "."))
        }

        const totalNF = parseCurrency(valorBruto)
        const totalReceived = parseCurrency(valorRecebido)

        // Extract client name from observacao
        let client = "DJR Reciclagem"
        if (observacao.includes("Entrada de Faturas")) {
          client = "DJR Reciclagem"
        }

        // Calculate status
        let status: Transaction["status"]
        if (totalReceived === totalNF && totalNF > 0) {
          status = "received"
        } else if (totalReceived > 0 && totalReceived < totalNF) {
          status = "partial"
        } else if (totalReceived === 0 && totalNF > 0) {
          status = "pending"
        } else {
          status = "divergent"
        }

        const transaction: Omit<Transaction, "id" | "status"> = {
          orderNumber: numeroDocumento,
          saleDate: saleDate,
          company: "Klabin",
          client: client,
          saleValue: totalNF,
          invoiceNumbers: notaFiscal,
          invoiceTotal: totalNF,
          totalReceived: totalReceived,
          paymentMethod: "",
          bankAccount: "",
          observations: observacao,
        }

        await createTransaction(transaction, status)
        successCount++
      } catch (error) {
        errorCount++
        errors.push(`Erro na linha: ${line.substring(0, 50)}... - ${error}`)
        console.error("[v0] Error importing line:", error)
      }
    }

    console.log(`[v0] Bulk import completed: ${successCount} success, ${errorCount} errors`)
    revalidatePath("/")

    return {
      success: true,
      imported: successCount,
      errors: errorCount,
      errorDetails: errors,
    }
  } catch (error) {
    console.error("[v0] Error in bulk import:", error)
    throw error
  }
}

export async function deleteTransaction(id: string) {
  try {
    console.log("[v0] Deleting transaction with id:", id)
    const result = await deleteTransactionDb(id)
    console.log("[v0] Transaction deleted:", result)

    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error in deleteTransaction:", error)
    throw error
  }
}
