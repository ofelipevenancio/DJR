-- Seed master data with existing values
-- This script populates the database with the hardcoded values currently in the forms

-- Insert companies
INSERT INTO empresas (nome) VALUES
  ('Klabin'),
  ('Jaepel'),
  ('Fernandez'),
  ('Vale Tambau')
ON CONFLICT (nome) DO NOTHING;

-- Insert bank accounts
INSERT INTO contas_bancarias (nome, agencia, conta) VALUES
  ('Sicoob Aracoop', '4264', '66433-2'),
  ('Sicoob Aracredi', '3093', '6610-9')
ON CONFLICT (nome, agencia, conta) DO NOTHING;

-- Insert payment methods
INSERT INTO formas_recebimento (nome) VALUES
  ('Pix'),
  ('Depósito'),
  ('Transferência'),
  ('Boleto'),
  ('Dinheiro'),
  ('Cheque')
ON CONFLICT (nome) DO NOTHING;
