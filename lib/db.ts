import { neon } from "@neondatabase/serverless"

function getDatabaseUrl(): string {
  const url = process.env.NEON_NEON_DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.NEON_POSTGRES_URL

  if (!url) {
    throw new Error("No database URL found. Please set DATABASE_URL environment variable.")
  }

  // Clean the URL if it has psql command wrapper
  let cleanUrl = url.trim()
  if (cleanUrl.startsWith("psql '") || cleanUrl.startsWith('psql "')) {
    cleanUrl = cleanUrl.replace(/^psql\s+['"]/, "").replace(/['"]$/, "")
  }

  return cleanUrl
}

const sql = neon(getDatabaseUrl())

// Database schema uses snake_case Portuguese names
export interface DbTransaction {
  id: number
  pedido: string
  data: string
  empresa: string
  cliente: string
  valor_vendido: number
  nf: string
  total_nf: number
  total_recebido: number
  forma_recebimento: string | null
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
    id: dbTx.id.toString(),
    orderNumber: dbTx.pedido,
    saleDate: dbTx.data,
    company: dbTx.empresa,
    client: dbTx.cliente,
    saleValue: Number(dbTx.valor_vendido),
    invoiceNumbers: dbTx.nf,
    invoiceTotal: Number(dbTx.total_nf),
    totalReceived: Number(dbTx.total_recebido),
    paymentMethod: dbTx.forma_recebimento || "",
    bankAccount: dbTx.banco_conta || "",
    observations: dbTx.observacoes,
    status: dbTx.status as Transaction["status"],
  }
}

// Convert frontend format to database format
function frontendToDb(
  tx: Omit<Transaction, "id" | "status">,
  status: string,
): Omit<DbTransaction, "id" | "created_at" | "updated_at"> {
  return {
    pedido: tx.orderNumber,
    data: tx.saleDate,
    empresa: tx.company,
    cliente: tx.client,
    valor_vendido: tx.saleValue,
    nf: tx.invoiceNumbers,
    total_nf: tx.invoiceTotal,
    total_recebido: tx.totalReceived,
    forma_recebimento: tx.paymentMethod || null,
    banco_conta: tx.bankAccount || null,
    observacoes: tx.observations,
    status,
  }
}

async function ensureTableExists() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        pedido TEXT NOT NULL,
        data DATE NOT NULL,
        empresa TEXT NOT NULL,
        cliente TEXT NOT NULL,
        valor_vendido DECIMAL(15, 2) DEFAULT 0,
        nf TEXT,
        total_nf DECIMAL(15, 2) DEFAULT 0,
        total_recebido DECIMAL(15, 2) DEFAULT 0,
        forma_recebimento TEXT,
        banco_conta TEXT,
        observacoes TEXT,
        status TEXT NOT NULL DEFAULT 'Pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("[v0] Table 'transactions' verified/created successfully")
  } catch (error) {
    console.error("[v0] Error creating table:", error)
    throw error
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    await ensureTableExists()
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
    await ensureTableExists()

    console.log("[v0] Creating transaction with data:", transaction)
    const dbTx = frontendToDb(transaction, status)

    console.log("[v0] Converted to DB format:", dbTx)

    const result = await sql`
      INSERT INTO transactions (
        pedido, data, empresa, cliente, valor_vendido, nf, total_nf, 
        total_recebido, forma_recebimento, banco_conta, observacoes, status
      ) VALUES (
        ${dbTx.pedido}, ${dbTx.data}, ${dbTx.empresa}, ${dbTx.cliente}, 
        ${dbTx.valor_vendido}, ${dbTx.nf}, ${dbTx.total_nf}, ${dbTx.total_recebido}, 
        ${dbTx.forma_recebimento}, ${dbTx.banco_conta}, ${dbTx.observacoes}, ${dbTx.status}
      )
      RETURNING *
    `

    console.log("[v0] Transaction created successfully:", result[0])
    return dbToFrontend(result[0] as DbTransaction)
  } catch (error) {
    console.error("[v0] Error creating transaction:", error)
    throw error
  }
}

export async function updateTransaction(
  id: string,
  transaction: Omit<Transaction, "id" | "status">,
  status: string,
): Promise<Transaction | null> {
  try {
    const dbTx = frontendToDb(transaction, status)

    const result = await sql`
      UPDATE transactions 
      SET 
        pedido = ${dbTx.pedido},
        data = ${dbTx.data},
        empresa = ${dbTx.empresa},
        cliente = ${dbTx.cliente},
        valor_vendido = ${dbTx.valor_vendido},
        nf = ${dbTx.nf},
        total_nf = ${dbTx.total_nf},
        total_recebido = ${dbTx.total_recebido},
        forma_recebimento = ${dbTx.forma_recebimento},
        banco_conta = ${dbTx.banco_conta},
        observacoes = ${dbTx.observacoes},
        status = ${dbTx.status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] ? dbToFrontend(result[0] as DbTransaction) : null
  } catch (error) {
    console.error("[v0] Error updating transaction:", error)
    return null
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    console.log("[v0] Deleting transaction with id:", id)
    const result = await sql`
      DELETE FROM transactions 
      WHERE id = ${id}
      RETURNING id
    `
    const success = result.length > 0
    console.log("[v0] Transaction deleted:", success)
    return success
  } catch (error) {
    console.error("[v0] Error deleting transaction:", error)
    return false
  }
}
