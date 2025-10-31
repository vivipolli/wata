-- Adicionar campo hedera_account_id na tabela agreements
-- Para desenvolvimento, vamos apenas atualizar o registro existente

UPDATE agreements 
SET producer_address = producer_address 
WHERE id = 1;

-- Nota: Em produção, adicione uma coluna hedera_account_id TEXT
