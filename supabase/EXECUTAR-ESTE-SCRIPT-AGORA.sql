-- ===================================================================
-- IMPORTANTE: Execute este script COMPLETO no SQL Editor do Supabase
-- ===================================================================

-- 1. Remover TODAS as versões antigas da função cadastrar_usuario
DROP FUNCTION IF EXISTS public.cadastrar_usuario(text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.cadastrar_usuario(text, text, text);

-- 2. Remover versão antiga da função verificar_usuario_login
DROP FUNCTION IF EXISTS public.verificar_usuario_login(text, text);

-- 3. Garantir que pgcrypto está habilitado
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 4. Criar a função de LOGIN (sem ambiguidade)
CREATE OR REPLACE FUNCTION public.verificar_usuario_login(
  u_email TEXT,
  u_senha TEXT
)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  nome VARCHAR,
  avatar_url TEXT,
  is_admin BOOLEAN,
  sucesso BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.nome,
    u.avatar_url,
    u.is_admin,
    (u.senha_hash = crypt(u_senha, u.senha_hash)) as sucesso
  FROM public.users u
  WHERE u.email = u_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar a função de CADASTRO (versão simplificada - 3 parâmetros)
CREATE OR REPLACE FUNCTION public.cadastrar_usuario(
  u_email TEXT,
  u_senha TEXT,
  u_nome TEXT
)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  nome VARCHAR,
  sucesso BOOLEAN,
  erro TEXT
) AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Verificar se já existe
  IF EXISTS (SELECT 1 FROM public.users WHERE users.email = u_email) THEN
    RETURN QUERY SELECT NULL::UUID, u_email::VARCHAR, NULL::VARCHAR, FALSE, 'Email já cadastrado'::TEXT;
    RETURN;
  END IF;

  -- Inserir novo usuário
  INSERT INTO public.users (email, senha_hash, nome)
  VALUES (
    u_email,
    crypt(u_senha, gen_salt('bf')),
    u_nome
  )
  RETURNING users.id INTO new_id;

  RETURN QUERY SELECT new_id, u_email::VARCHAR, u_nome::VARCHAR, TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verificar se as funções foram criadas corretamente
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as parameters
FROM pg_proc 
WHERE proname IN ('cadastrar_usuario', 'verificar_usuario_login')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Você deve ver APENAS:
-- cadastrar_usuario    | u_email text, u_senha text, u_nome text
-- verificar_usuario_login | u_email text, u_senha text
