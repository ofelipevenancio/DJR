-- Drop existing tables and sequences if they exist
DROP TABLE IF EXISTS empresas CASCADE;
DROP TABLE IF EXISTS contas_bancarias CASCADE;
DROP TABLE IF EXISTS formas_recebimento CASCADE;

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

-- Insert default empresas
INSERT INTO empresas (nome) VALUES
  ('Klabin'),
  ('Jaepel'),
  ('Fernandez'),
  ('Vale Tambau');

-- Insert default contas bancárias
INSERT INTO contas_bancarias (nome) VALUES
  ('Sicoob Aracoop'),
  ('Sicoob Aracredi');

-- Insert default formas de recebimento
INSERT INTO formas_recebimento (nome) VALUES
  ('Dinheiro'),
  ('PIX'),
  ('Transferência'),
  ('Boleto'),
  ('Cheque');
