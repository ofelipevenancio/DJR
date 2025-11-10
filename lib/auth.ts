import { neon } from "@neondatabase/serverless"

function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.NEON_POSTGRES_URL_NO_SSL

  if (!url) {
    throw new Error("No database URL found")
  }

  let cleanUrl = url.trim()
  if (cleanUrl.startsWith("psql '") || cleanUrl.startsWith('psql "')) {
    cleanUrl = cleanUrl.replace(/^psql\s+['"]/, "").replace(/['"]$/, "")
  }
  cleanUrl = cleanUrl.replace(/[&?]channel_binding=\w+/g, "")
  cleanUrl = cleanUrl.replace(/[&?]sslmode=\w+/g, "")
  cleanUrl = cleanUrl.replace(/[?&]$/, "")

  return cleanUrl
}

const sql = neon(getDatabaseUrl())

export interface User {
  id: string
  email: string
  role: "admin" | "readonly"
  nome: string | null
  ativo: boolean
}

// Simple password hashing (in production, use proper bcrypt)
function hashPassword(password: string): string {
  // This is a simplified version. In production, use proper bcrypt hashing
  return Buffer.from(password).toString("base64")
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export async function ensureUsersTableExists() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'readonly',
        nome TEXT,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Check if users exist, if not create default ones
    const userCount = await sql`SELECT COUNT(*) as count FROM users`
    if (Number(userCount[0].count) === 0) {
      const defaultUsers = [
        { email: "adm@djr.com.br", password: "Djr@2025", role: "admin", nome: "Administrador" },
        { email: "financeiro@djr.com.br", password: "Djr@2025", role: "admin", nome: "Financeiro" },
        { email: "acesso@djr.com.br", password: "Djr@2025", role: "readonly", nome: "Acesso Visualização" },
      ]

      for (const user of defaultUsers) {
        const hash = hashPassword(user.password)
        await sql`
          INSERT INTO users (email, password_hash, role, nome)
          VALUES (${user.email}, ${hash}, ${user.role}, ${user.nome})
          ON CONFLICT (email) DO NOTHING
        `
      }
      console.log("[v0] ✓ Default users created")
    }

    return true
  } catch (error) {
    console.error("[v0] Error ensuring users table:", error)
    return false
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    await ensureUsersTableExists()

    const result = await sql`
      SELECT id, email, password_hash, role, nome, ativo 
      FROM users 
      WHERE email = ${email.toLowerCase().trim()} AND ativo = true
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const isValidPassword = verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id.toString(),
      email: user.email,
      role: user.role as "admin" | "readonly",
      nome: user.nome,
      ativo: user.ativo,
    }
  } catch (error) {
    console.error("[v0] Error authenticating user:", error)
    return null
  }
}
