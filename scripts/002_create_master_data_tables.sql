-- Create tables for master data management
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contas_bancarias (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS formas_recebimento (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default values
INSERT INTO empresas (nome) VALUES 
  ('Klabin'),
  ('Jaepel'),
  ('Fernandez'),
  ('Vale Tambau')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO contas_bancarias (nome) VALUES 
  ('Sicoob Aracoop'),
  ('Sicoob Aracredi')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO formas_recebimento (nome) VALUES 
  ('Dinheiro'),
  ('PIX'),
  ('Transferência'),
  ('Boleto'),
  ('Cheque')
ON CONFLICT (nome) DO NOTHING;
