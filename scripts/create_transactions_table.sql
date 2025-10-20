-- Criar tabela de transações
DROP TABLE IF EXISTS transactions;

CREATE TABLE transactions (
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
);

-- Criar índices para melhor performance
CREATE INDEX idx_transactions_pedido ON transactions(pedido);
CREATE INDEX idx_transactions_empresa ON transactions(empresa);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_data ON transactions(data);
