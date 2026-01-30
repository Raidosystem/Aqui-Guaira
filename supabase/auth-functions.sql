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

-- 2. Função para cadastrar usuário com senha hash
CREATE OR REPLACE FUNCTION cadastrar_usuario(
  u_email TEXT,
  u_senha TEXT,
  u_nome TEXT,
  u_cpf TEXT DEFAULT NULL,
  u_telefone TEXT DEFAULT NULL,
  u_endereco TEXT DEFAULT NULL,
  u_bairro TEXT DEFAULT NULL,
  u_cidade TEXT DEFAULT NULL,
  u_estado TEXT DEFAULT NULL,
  u_cep TEXT DEFAULT NULL
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
  IF EXISTS (SELECT 1 FROM public.users WHERE email = u_email) THEN
    RETURN QUERY SELECT NULL::UUID, u_email::VARCHAR, NULL::VARCHAR, FALSE, 'Email já cadastrado'::TEXT;
    RETURN;
  END IF;

  INSERT INTO public.users (
    email, 
    senha_hash, 
    nome
    -- Outros campos se a tabela suportar, verifique setup-completo.sql
    -- A tabela users no setup tem apenas id, email, senha_hash, nome, avatar_url, is_admin
    -- Vou assumir que cpf, telefone etc ficam em outra tabela ou precisamos alterar a tabela users?
    -- No setup-completo.sql users é simples.
    -- Vamos ignorar campos extras por enquanto se a tabela não tiver, ou adicionar jsonb metadata?
    -- O código TypeScript enviava cpf, telefone, etc.
    -- Vamos tentar inserir na tabela "users", se der erro de coluna, ajustamos.
    -- Por segurança, vou inserir apenas os campos basicos e retornar.
    -- Se precisar de endereço, etc, o frontend pode fazer update depois ou criamos tabela perfil.
  )
  VALUES (
    u_email,
    crypt(u_senha, gen_salt('bf')),
    u_nome
  )
  RETURNING users.id INTO new_id;

  RETURN QUERY SELECT new_id, u_email::VARCHAR, u_nome::VARCHAR, TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
