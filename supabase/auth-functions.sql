-- EXTENSION pgcrypto must be enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Função para verificar login de usuário (public.users)
CREATE OR REPLACE FUNCTION verificar_usuario_login(
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

-- 2. Função para cadastrar usuário com senha hash (SIMPLIFICADA)
CREATE OR REPLACE FUNCTION cadastrar_usuario(
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
