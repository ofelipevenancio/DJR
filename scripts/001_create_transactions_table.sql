-- Create transactions table with Portuguese field names
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  pedido TEXT NOT NULL,
  data TEXT NOT NULL,
  empresa TEXT NOT NULL,
  cliente TEXT NOT NULL,
  valor_vendido DECIMAL(15, 2) DEFAULT 0,
  nf_numeros TEXT NOT NULL,
  total_nf DECIMAL(15, 2) DEFAULT 0,
  total_recebido DECIMAL(15, 2) DEFAULT 0,
  forma_pagamento TEXT,
  banco_conta TEXT,
  observacoes TEXT DEFAULT '',
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_empresa ON transactions(empresa);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_data ON transactions(data);
CREATE INDEX IF NOT EXISTS idx_transactions_pedido ON transactions(pedido);
