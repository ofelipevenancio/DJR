import { neon } from "@neondatabase/serverless"

function getDatabaseUrl(): string {
  // Try different environment variables in order of preference
  const possibleUrls = [process.env.NEON_DATABASE_URL, process.env.NEON_DATABASE_URL, process.env.NEON_POSTGRES_URL]

  for (const url of possibleUrls) {
    if (url) {
      // Clean the URL if it has psql command wrapper
      let cleanUrl = url.trim()

      // Remove psql command wrapper if present
      if (cleanUrl.startsWith("psql '") || cleanUrl.startsWith('psql "')) {
        cleanUrl = cleanUrl.replace(/^psql\s+['"]/, "").replace(/['"]$/, "")
      }

      // Validate it's a proper URL
      if (cleanUrl.startsWith("postgres://") || cleanUrl.startsWith("postgresql://")) {
        return cleanUrl
      }
    }
  }

  throw new Error("No valid database URL found in environment variables")
}

const sql = neon(getDatabaseUrl())

// Database schema uses snake_case Portuguese names
export interface DbTransaction {
  id: string
  pedido: string
  data: string
  empresa: string
  cliente: string
  valor_vendido: number
  nf_numeros: string
  total_nf: number
  total_recebido: number
  forma_pagamento: string | null
  banco_conta: string | null
  observacoes: string
  status: string
  created_at?: string
  updated_at?: string
}

// Frontend uses camelCase English names
export interface Transaction {
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

// Convert database format to frontend format
function dbToFrontend(dbTx: DbTransaction): Transaction {
  return {
    id: dbTx.id,
    orderNumber: dbTx.pedido,
    saleDate: dbTx.data,
    company: dbTx.empresa,
    client: dbTx.cliente,
    saleValue: Number(dbTx.valor_vendido),
    invoiceNumbers: dbTx.nf_numeros,
    invoiceTotal: Number(dbTx.total_nf),
    totalReceived: Number(dbTx.total_recebido),
    paymentMethod: dbTx.forma_pagamento || "",
    bankAccount: dbTx.banco_conta || "",
    observations: dbTx.observacoes,
    status: dbTx.status as Transaction["status"],
  }
}

// Convert frontend format to database format
function frontendToDb(tx: Omit<Transaction, "id" | "status">, id: string, status: string): DbTransaction {
  return {
    id,
    pedido: tx.orderNumber,
    data: tx.saleDate,
    empresa: tx.company,
    cliente: tx.client,
    valor_vendido: tx.saleValue,
    nf_numeros: tx.invoiceNumbers,
    total_nf: tx.invoiceTotal,
    total_recebido: tx.totalReceived,
    forma_pagamento: tx.paymentMethod || null,
    banco_conta: tx.bankAccount || null,
    observacoes: tx.observations,
    status,
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const result = await sql`SELECT * FROM transactions ORDER BY data DESC, created_at DESC`
    return result.map(dbToFrontend)
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    return []
  }
}

export async function createTransaction(
  transaction: Omit<Transaction, "id" | "status">,
  status: string,
): Promise<Transaction | null> {
  try {
    const id = Date.now().toString()
    const dbTx = frontendToDb(transaction, id, status)

    const result = await sql`
      INSERT INTO transactions (
        id, pedido, data, empresa, cliente, valor_vendido, nf_numeros, total_nf, 
        total_recebido, forma_pagamento, banco_conta, observacoes, status
      ) VALUES (
        ${dbTx.id}, ${dbTx.pedido}, ${dbTx.data}, ${dbTx.empresa}, ${dbTx.cliente}, 
        ${dbTx.valor_vendido}, ${dbTx.nf_numeros}, ${dbTx.total_nf}, ${dbTx.total_recebido}, 
        ${dbTx.forma_pagamento}, ${dbTx.banco_conta}, ${dbTx.observacoes}, ${dbTx.status}
      )
      RETURNING *
    `
    return dbToFrontend(result[0] as DbTransaction)
  } catch (error) {
    console.error("[v0] Error creating transaction:", error)
    return null
  }
}

export async function updateTransaction(
  id: string,
  transaction: Omit<Transaction, "id" | "status">,
  status: string,
): Promise<Transaction | null> {
  try {
    const dbTx = frontendToDb(transaction, id, status)

    const result = await sql`
      UPDATE transactions 
      SET 
        pedido = ${dbTx.pedido},
        data = ${dbTx.data},
        empresa = ${dbTx.empresa},
        cliente = ${dbTx.cliente},
        valor_vendido = ${dbTx.valor_vendido},
        nf_numeros = ${dbTx.nf_numeros},
        total_nf = ${dbTx.total_nf},
        total_recebido = ${dbTx.total_recebido},
        forma_pagamento = ${dbTx.forma_pagamento},
        banco_conta = ${dbTx.banco_conta},
        observacoes = ${dbTx.observacoes},
        status = ${dbTx.status},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] ? dbToFrontend(result[0] as DbTransaction) : null
  } catch (error) {
    console.error("[v0] Error updating transaction:", error)
    return null
  }
}
