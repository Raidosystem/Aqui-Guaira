-- Adicionar campos CNPJ e CNAE na tabela empresas

ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS cnae TEXT,
ADD COLUMN IF NOT EXISTS cnae_secundario TEXT,
ADD COLUMN IF NOT EXISTS subcategorias TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Criar índice para CNPJ (para buscas rápidas)
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON public.empresas(cnpj);

COMMENT ON COLUMN public.empresas.cnpj IS 'CNPJ da empresa (apenas números)';
COMMENT ON COLUMN public.empresas.cnae IS 'CNAE principal da empresa';
COMMENT ON COLUMN public.empresas.cnae_secundario IS 'CNAE secundário da empresa';
COMMENT ON COLUMN public.empresas.subcategorias IS 'Array de subcategorias da empresa';
