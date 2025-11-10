-- Create users table with authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'readonly', -- 'admin' or 'readonly'
  nome TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
-- Password for all: Djr@2025 (hashed with bcrypt)
INSERT INTO users (email, password_hash, role, nome) VALUES
  ('adm@djr.com.br', '$2a$10$YourHashHere', 'admin', 'Administrador'),
  ('financeiro@djr.com.br', '$2a$10$YourHashHere', 'admin', 'Financeiro'),
  ('acesso@djr.com.br', '$2a$10$YourHashHere', 'readonly', 'Acesso Visualização')
ON CONFLICT (email) DO NOTHING;
