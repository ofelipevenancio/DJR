-- Add discount field to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS desconto DECIMAL(15, 2) DEFAULT 0;

-- Add comment to explain the field
COMMENT ON COLUMN transactions.desconto IS 'Valor de desconto concedido ao cliente';
