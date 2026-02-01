-- Sistema de Administração Seguro

-- 1. Adicionar colunas faltantes na tabela admins (se já existir)
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- 1b. Criar tabela de administradores (se não existir)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT,
  super_admin BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar função para hash de senha (usando crypt do pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Criar função segura de login de admin
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
  -- Buscar admin pelo email
  SELECT id, nome, senha_hash, super_admin, ativo
  INTO v_admin
  FROM public.admins
  WHERE email = p_email;

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

-- 4. Inserir super admin
INSERT INTO public.admins (email, senha_hash, nome, super_admin, ativo)
VALUES (
  'novaradiosystem@outlook.com',
  crypt('@Qw12aszx##', gen_salt('bf')),
  'Super Admin',
  TRUE,
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  senha_hash = crypt('@Qw12aszx##', gen_salt('bf')),
  super_admin = TRUE,
  ativo = TRUE;

-- 5. Configurar RLS para proteger a tabela admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Ninguém pode ler diretamente a tabela admins (apenas via função)
DROP POLICY IF EXISTS "Bloquear acesso direto à tabela admins" ON public.admins;
CREATE POLICY "Bloquear acesso direto à tabela admins"
ON public.admins
FOR ALL
TO anon, authenticated
USING (false);

-- 6. Dar permissão para executar a função de login
GRANT EXECUTE ON FUNCTION public.admin_login(TEXT, TEXT) TO anon, authenticated;

-- 7. Criar função para adicionar novos admins (apenas super admin)
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
  -- Verificar se quem está criando é super admin
  SELECT super_admin INTO v_is_super_admin
  FROM public.admins
  WHERE id = p_super_admin_id AND ativo = TRUE;

  IF NOT FOUND OR NOT v_is_super_admin THEN
    RETURN QUERY SELECT FALSE, 'Apenas super admins podem criar novos administradores'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Verificar se email já existe
  IF EXISTS (SELECT 1 FROM public.admins WHERE email = p_email) THEN
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

-- 8. Comentários
COMMENT ON TABLE public.admins IS 'Tabela de administradores do sistema - protegida por RLS';
COMMENT ON FUNCTION public.admin_login IS 'Função segura para autenticação de administradores - não expõe hashes de senha';
COMMENT ON FUNCTION public.criar_admin IS 'Função para super admins criarem novos administradores';
