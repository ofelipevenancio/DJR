-- Script para limpar todos os lançamentos
-- Executado em: 26/11/2025

-- Limpar todas as transações
DELETE FROM transactions;

-- Confirmar limpeza
SELECT 'Todos os lançamentos foram removidos com sucesso!' as resultado;
