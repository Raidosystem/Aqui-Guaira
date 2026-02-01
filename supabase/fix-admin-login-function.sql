-- Fix para corrigir ambiguidade na função admin_login

-- Drop e recriar a função admin_login com alias de tabela
DROP FUNCTION IF EXISTS public.admin_login(TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.admin_login(
  p_email TEXT,
  p_senha TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  admin_id UUID,
  nome TEXT,
  super_admin BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin RECORD;
BEGIN
  -- Buscar admin pelo email (usando alias 'a' para evitar ambiguidade)
  SELECT a.id, a.nome, a.senha_hash, a.super_admin, a.ativo
  INTO v_admin
  FROM public.admins a
  WHERE a.email = p_email;

  -- Verificar se admin existe e está ativo
  IF NOT FOUND OR NOT v_admin.ativo THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Verificar senha
  IF v_admin.senha_hash = crypt(p_senha, v_admin.senha_hash) THEN
    RETURN QUERY SELECT TRUE, v_admin.id, v_admin.nome, v_admin.super_admin;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, FALSE;
  END IF;
END;
$$;

-- Dar permissão para executar a função
GRANT EXECUTE ON FUNCTION public.admin_login(TEXT, TEXT) TO anon, authenticated;

-- Drop e recriar a função criar_admin com alias de tabela
DROP FUNCTION IF EXISTS public.criar_admin(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.criar_admin(
  p_super_admin_id UUID,
  p_email TEXT,
  p_senha TEXT,
  p_nome TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  admin_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_super_admin BOOLEAN;
  v_new_admin_id UUID;
BEGIN
  -- Verificar se quem está criando é super admin (usando alias 'a')
  SELECT a.super_admin INTO v_is_super_admin
  FROM public.admins a
  WHERE a.id = p_super_admin_id AND a.ativo = TRUE;

  IF NOT FOUND OR NOT v_is_super_admin THEN
    RETURN QUERY SELECT FALSE, 'Apenas super admins podem criar novos administradores'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Verificar se email já existe (usando alias 'a')
  IF EXISTS (SELECT 1 FROM public.admins a WHERE a.email = p_email) THEN
    RETURN QUERY SELECT FALSE, 'Email já cadastrado'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Criar novo admin
  INSERT INTO public.admins (email, senha_hash, nome, super_admin, ativo)
  VALUES (
    p_email,
    crypt(p_senha, gen_salt('bf')),
    p_nome,
    FALSE, -- Novos admins não são super admins
    TRUE
  )
  RETURNING id INTO v_new_admin_id;

  RETURN QUERY SELECT TRUE, 'Admin criado com sucesso'::TEXT, v_new_admin_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_admin(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Testar a função corrigida
SELECT * FROM public.admin_login(
    'novaradiosystem@outlook.com',
    '@Qw12aszx##'
);
