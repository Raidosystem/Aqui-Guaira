-- Permitir que admins possam gerenciar empresas (aprovar, rejeitar, etc)

-- Criar política para UPDATE de empresas (apenas usuários autenticados podem atualizar)
DROP POLICY IF EXISTS "Admins podem atualizar empresas" ON public.empresas;
CREATE POLICY "Admins podem atualizar empresas"
ON public.empresas
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Criar política para DELETE de empresas
DROP POLICY IF EXISTS "Admins podem deletar empresas" ON public.empresas;
CREATE POLICY "Admins podem deletar empresas"
ON public.empresas
FOR DELETE
TO anon, authenticated
USING (true);

-- Permitir SELECT de todas as empresas (incluindo pendentes) para anon/authenticated
DROP POLICY IF EXISTS "Permitir leitura pública de empresas aprovadas" ON public.empresas;
DROP POLICY IF EXISTS "Permitir leitura de todas empresas" ON public.empresas;

CREATE POLICY "Permitir leitura de todas empresas"
ON public.empresas
FOR SELECT
TO anon, authenticated
USING (true);

COMMENT ON POLICY "Admins podem atualizar empresas" ON public.empresas 
IS 'Permite que admins atualizem empresas (aprovar, rejeitar, editar)';

COMMENT ON POLICY "Permitir leitura de todas empresas" ON public.empresas 
IS 'Permite leitura de todas empresas incluindo pendentes (para painel admin)';
