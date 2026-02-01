-- Verificar e desabilitar RLS temporariamente para debug

-- Desabilitar RLS na tabela empresas (APENAS PARA TESTE)
ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;

-- Para reabilitar depois:
-- ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
