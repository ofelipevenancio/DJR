-- Drop existing tables and sequences to start fresh
DROP TABLE IF EXISTS formas_recebimento CASCADE;
DROP TABLE IF EXISTS contas_bancarias CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;

-- Create empresas table
CREATE TABLE empresas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contas_bancarias table
CREATE TABLE contas_bancarias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create formas_recebimento table
CREATE TABLE formas_recebimento (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data
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
