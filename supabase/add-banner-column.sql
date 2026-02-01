-- Adicionar coluna banner na tabela empresas
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS banner TEXT;

-- Comentário explicando o campo
COMMENT ON COLUMN empresas.banner IS 'URL da imagem de banner/capa da empresa';
