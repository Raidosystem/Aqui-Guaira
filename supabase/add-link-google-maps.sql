-- Adicionar coluna link_google_maps na tabela empresas
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS link_google_maps TEXT;

-- Comentário explicativo
COMMENT ON COLUMN public.empresas.link_google_maps IS 'Link do Google Maps/Google Meu Negócio da empresa';
