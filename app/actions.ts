"use server"

import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction as deleteTransactionDb,
  type Transaction,
  getEmpresas,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getContasBancarias,
  createContaBancaria,
  updateContaBancaria,
  deleteContaBancaria,
  getFormasRecebimento,
  createFormaRecebimento,
  updateFormaRecebimento,
  deleteFormaRecebimento,
  type MasterDataItem,
} from "@/lib/db"
import { authenticateUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function login(email: string, password: string) {
  try {
    const user = await authenticateUser(email, password)
    return user
  } catch (error) {
    console.error("[v0] Login error:", error)
    return null
  }
}

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

export async function bulkDeleteTransactions(ids: string[]) {
  try {
    console.log("[v0] Bulk deleting transactions:", ids.length)

    for (const id of ids) {
      await deleteTransactionDb(id)
    }

    console.log("[v0] Bulk delete completed")
    revalidatePath("/")
    return { success: true, deleted: ids.length }
  } catch (error) {
    console.error("[v0] Error in bulkDeleteTransactions:", error)
    throw error
  }
}

export async function fetchEmpresas(): Promise<MasterDataItem[]> {
  try {
    return await getEmpresas()
  } catch (error) {
    console.error("[v0] Error fetching empresas:", error)
    return []
  }
}

export async function addEmpresa(nome: string) {
  try {
    const result = await createEmpresa(nome)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error adding empresa:", error)
    return null
  }
}

export async function editEmpresa(id: string, nome: string) {
  try {
    const result = await updateEmpresa(id, nome)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error editing empresa:", error)
    return false
  }
}

export async function removeEmpresa(id: string) {
  try {
    const result = await deleteEmpresa(id)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error removing empresa:", error)
    return false
  }
}

export async function fetchContasBancarias(): Promise<MasterDataItem[]> {
  try {
    return await getContasBancarias()
  } catch (error) {
    console.error("[v0] Error fetching contas bancarias:", error)
    return []
  }
}

export async function addContaBancaria(nome: string) {
  try {
    const result = await createContaBancaria(nome)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error adding conta bancaria:", error)
    return null
  }
}

export async function editContaBancaria(id: string, nome: string) {
  try {
    const result = await updateContaBancaria(id, nome)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error editing conta bancaria:", error)
    return false
  }
}

export async function removeContaBancaria(id: string) {
  try {
    const result = await deleteContaBancaria(id)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error removing conta bancaria:", error)
    return false
  }
}

export async function fetchFormasRecebimento(): Promise<MasterDataItem[]> {
  try {
    return await getFormasRecebimento()
  } catch (error) {
    console.error("[v0] Error fetching formas recebimento:", error)
    return []
  }
}

export async function addFormaRecebimento(nome: string) {
  try {
    const result = await createFormaRecebimento(nome)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error adding forma recebimento:", error)
    return null
  }
}

export async function editFormaRecebimento(id: string, nome: string) {
  try {
    const result = await updateFormaRecebimento(id, nome)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error editing forma recebimento:", error)
    return false
  }
}

export async function removeFormaRecebimento(id: string) {
  try {
    const result = await deleteFormaRecebimento(id)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("[v0] Error removing forma recebimento:", error)
    return false
  }
}
