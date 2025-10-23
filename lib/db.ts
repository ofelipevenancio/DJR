import { neon } from "@neondatabase/serverless"

function getDatabaseUrl(): string {
  // Try different environment variables in order of preference
  const url =
    process.env.NEON_NEON_DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.NEON_POSTGRES_URL_NO_SSL

  if (!url) {
    throw new Error("No database URL found. Please set DATABASE_URL environment variable.")
  }

  // Clean the URL if it has psql command wrapper
  let cleanUrl = url.trim()
  if (cleanUrl.startsWith("psql '") || cleanUrl.startsWith('psql "')) {
    cleanUrl = cleanUrl.replace(/^psql\s+['"]/, "").replace(/['"]$/, "")
  }

  // Remove unsupported parameters for Neon serverless driver
  cleanUrl = cleanUrl.replace(/[&?]channel_binding=\w+/g, "")
  cleanUrl = cleanUrl.replace(/[&?]sslmode=\w+/g, "")

  // Clean up trailing ? or &
  cleanUrl = cleanUrl.replace(/[?&]$/, "")

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
  desconto: number
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
  discount: number
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
    discount: Number(dbTx.desconto || 0),
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
    desconto: tx.discount || 0,
    forma_recebimento: tx.paymentMethod || null,
    banco_conta: tx.bankAccount || null,
    observacoes: tx.observations,
    status,
  }
}

async function runMigrations() {
  try {
    console.log("[v0] Running database migrations...")

    // Migration 1: Ensure transactions table exists
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
    console.log("[v0] ✓ Transactions table verified")

    // Migration 2: Add discount column if it doesn't exist
    await sql`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS desconto DECIMAL(15, 2) DEFAULT 0
    `
    console.log("[v0] ✓ Discount column added")

    // Migration 3: Create empresas table
    await sql`
      CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("[v0] ✓ Empresas table verified")

    // Migration 4: Create contas_bancarias table
    await sql`
      CREATE TABLE IF NOT EXISTS contas_bancarias (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("[v0] ✓ Contas bancárias table verified")

    // Migration 5: Create formas_recebimento table
    await sql`
      CREATE TABLE IF NOT EXISTS formas_recebimento (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("[v0] ✓ Formas de recebimento table verified")

    // Migration 6: Seed initial data only if tables are empty
    const empresasCount = await sql`SELECT COUNT(*) as count FROM empresas`
    if (Number(empresasCount[0].count) === 0) {
      await sql`
        INSERT INTO empresas (nome) VALUES
          ('Klabin'),
          ('Jaepel'),
          ('Fernandez'),
          ('Vale Tambau')
        ON CONFLICT (nome) DO NOTHING
      `
      console.log("[v0] ✓ Empresas seeded with initial data")
    }

    const contasCount = await sql`SELECT COUNT(*) as count FROM contas_bancarias`
    if (Number(contasCount[0].count) === 0) {
      await sql`
        INSERT INTO contas_bancarias (nome) VALUES
          ('Sicoob Aracoop - Ag. 4264 - C/C 66433-2'),
          ('Sicoob Aracredi - Ag. 3093 - C/C 6610-9')
        ON CONFLICT (nome) DO NOTHING
      `
      console.log("[v0] ✓ Contas bancárias seeded with initial data")
    }

    const formasCount = await sql`SELECT COUNT(*) as count FROM formas_recebimento`
    if (Number(formasCount[0].count) === 0) {
      await sql`
        INSERT INTO formas_recebimento (nome) VALUES
          ('Pix'),
          ('Depósito'),
          ('Transferência'),
          ('Boleto'),
          ('Dinheiro'),
          ('Cheque')
        ON CONFLICT (nome) DO NOTHING
      `
      console.log("[v0] ✓ Formas de recebimento seeded with initial data")
    }

    console.log("[v0] All migrations completed successfully!")
    return true
  } catch (error) {
    console.error("[v0] Error running migrations:", error)
    return false
  }
}

// Run migrations once on module load
let migrationsRun = false
async function ensureMigrationsRun() {
  if (!migrationsRun) {
    migrationsRun = true
    await runMigrations()
  }
}

// Empresas (Companies)
export async function getEmpresas(): Promise<MasterDataItem[]> {
  try {
    await ensureMigrationsRun()
    const result = await sql`SELECT id, nome, ativo FROM empresas ORDER BY nome`
    return result.map((row: any) => ({
      id: row.id.toString(),
      nome: row.nome,
      ativo: row.ativo,
    }))
  } catch (error) {
    console.error("[v0] Error fetching empresas:", error)
    return []
  }
}

export async function createEmpresa(nome: string): Promise<MasterDataItem | null> {
  try {
    const result = await sql`
      INSERT INTO empresas (nome) VALUES (${nome})
      RETURNING id, nome, ativo
    `
    return {
      id: result[0].id.toString(),
      nome: result[0].nome,
      ativo: result[0].ativo,
    }
  } catch (error) {
    console.error("[v0] Error creating empresa:", error)
    return null
  }
}

export async function updateEmpresa(id: string, nome: string): Promise<boolean> {
  try {
    await sql`
      UPDATE empresas 
      SET nome = ${nome}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
    return true
  } catch (error) {
    console.error("[v0] Error updating empresa:", error)
    return false
  }
}

export async function deleteEmpresa(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM empresas WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("[v0] Error deleting empresa:", error)
    return false
  }
}

// Contas Bancárias (Bank Accounts)
export async function getContasBancarias(): Promise<MasterDataItem[]> {
  try {
    await ensureMigrationsRun()
    const result = await sql`SELECT id, nome, ativo FROM contas_bancarias ORDER BY nome`
    return result.map((row: any) => ({
      id: row.id.toString(),
      nome: row.nome,
      ativo: row.ativo,
    }))
  } catch (error) {
    console.error("[v0] Error fetching contas bancarias:", error)
    return []
  }
}

export async function createContaBancaria(nome: string): Promise<MasterDataItem | null> {
  try {
    const result = await sql`
      INSERT INTO contas_bancarias (nome) VALUES (${nome})
      RETURNING id, nome, ativo
    `
    return {
      id: result[0].id.toString(),
      nome: result[0].nome,
      ativo: result[0].ativo,
    }
  } catch (error) {
    console.error("[v0] Error creating conta bancaria:", error)
    return null
  }
}

export async function updateContaBancaria(id: string, nome: string): Promise<boolean> {
  try {
    await sql`
      UPDATE contas_bancarias 
      SET nome = ${nome}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
    return true
  } catch (error) {
    console.error("[v0] Error updating conta bancaria:", error)
    return false
  }
}

export async function deleteContaBancaria(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM contas_bancarias WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("[v0] Error deleting conta bancaria:", error)
    return false
  }
}

// Formas de Recebimento (Payment Methods)
export async function getFormasRecebimento(): Promise<MasterDataItem[]> {
  try {
    await ensureMigrationsRun()
    const result = await sql`SELECT id, nome, ativo FROM formas_recebimento ORDER BY nome`
    return result.map((row: any) => ({
      id: row.id.toString(),
      nome: row.nome,
      ativo: row.ativo,
    }))
  } catch (error) {
    console.error("[v0] Error fetching formas recebimento:", error)
    return []
  }
}

export async function createFormaRecebimento(nome: string): Promise<MasterDataItem | null> {
  try {
    const result = await sql`
      INSERT INTO formas_recebimento (nome) VALUES (${nome})
      RETURNING id, nome, ativo
    `
    return {
      id: result[0].id.toString(),
      nome: result[0].nome,
      ativo: result[0].ativo,
    }
  } catch (error) {
    console.error("[v0] Error creating forma recebimento:", error)
    return null
  }
}

export async function updateFormaRecebimento(id: string, nome: string): Promise<boolean> {
  try {
    await sql`
      UPDATE formas_recebimento 
      SET nome = ${nome}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
    return true
  } catch (error) {
    console.error("[v0] Error updating forma recebimento:", error)
    return false
  }
}

export async function deleteFormaRecebimento(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM formas_recebimento WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("[v0] Error deleting forma recebimento:", error)
    return false
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    await ensureMigrationsRun()
    console.log("[v0] Fetching transactions from database...")
    const result = await sql`SELECT * FROM transactions ORDER BY data DESC, created_at DESC`
    console.log(`[v0] Fetched transactions: ${result.length}`)
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
    await ensureMigrationsRun()

    console.log("[v0] Creating transaction with data:", transaction)
    const dbTx = frontendToDb(transaction, status)

    console.log("[v0] Converted to DB format:", dbTx)

    const result = await sql`
      INSERT INTO transactions (
        pedido, data, empresa, cliente, valor_vendido, nf, total_nf, 
        total_recebido, desconto, forma_recebimento, banco_conta, observacoes, status
      ) VALUES (
        ${dbTx.pedido}, ${dbTx.data}, ${dbTx.empresa}, ${dbTx.cliente}, 
        ${dbTx.valor_vendido}, ${dbTx.nf}, ${dbTx.total_nf}, ${dbTx.total_recebido}, 
        ${dbTx.desconto}, ${dbTx.forma_recebimento}, ${dbTx.banco_conta}, ${dbTx.observacoes}, ${dbTx.status}
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
        desconto = ${dbTx.desconto},
        forma_recebimento = ${dbTx.forma_recebimento},
        banco_conta = ${dbTx.banco_conta},
        observacoes = ${dbTx.observations},
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

// Master data interfaces and functions
export interface MasterDataItem {
  id: string
  nome: string
  ativo: boolean
}
