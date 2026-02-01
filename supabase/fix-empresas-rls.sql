-- Permitir INSERT público na tabela empresas (para cadastro de novas empresas)

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir insert público de empresas" ON public.empresas;
DROP POLICY IF EXISTS "public_insert_empresas" ON public.empresas;

-- Criar política que permite qualquer pessoa inserir empresas
CREATE POLICY "Permitir cadastro público de empresas"
ON public.empresas
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir leitura pública de empresas aprovadas
DROP POLICY IF EXISTS "Permitir leitura pública de empresas aprovadas" ON public.empresas;

CREATE POLICY "Permitir leitura pública de empresas aprovadas"
ON public.empresas
FOR SELECT
TO anon, authenticated
USING (status = 'aprovado' AND ativa = true);

-- Comentário
COMMENT ON POLICY "Permitir cadastro público de empresas" ON public.empresas 
IS 'Permite que qualquer pessoa cadastre uma empresa (ficará pendente de aprovação)';
