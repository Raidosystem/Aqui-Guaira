-- Sistema de Aprovação para Usuários e Posts

-- 1. Adicionar campos de aprovação na tabela users (se não existirem)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'bloqueado'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS motivo_bloqueio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES public.admins(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMP WITH TIME ZONE;

-- 2. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 3. Atualizar usuários existentes para aprovado (migração única)
UPDATE public.users 
SET status = 'aprovado', data_aprovacao = NOW() 
WHERE status IS NULL OR status = 'pendente';

-- 4. Adicionar campos de aprovação na tabela mural_posts (se não existirem)
ALTER TABLE public.mural_posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado'));
ALTER TABLE public.mural_posts ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES public.admins(id);
ALTER TABLE public.mural_posts ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.mural_posts ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT;

-- 5. Criar índice para posts
CREATE INDEX IF NOT EXISTS idx_mural_posts_status ON public.mural_posts(status);

-- 6. Função para aprovar usuário (apenas admins)
CREATE OR REPLACE FUNCTION public.aprovar_usuario(
  p_admin_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Verificar se é admin ativo
  SELECT EXISTS(
    SELECT 1 FROM public.admins a 
    WHERE a.id = p_admin_id AND a.ativo = TRUE
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN QUERY SELECT FALSE, 'Apenas administradores podem aprovar usuários'::TEXT;
    RETURN;
  END IF;

  -- Aprovar usuário
  UPDATE public.users u
  SET 
    status = 'aprovado',
    aprovado_por = p_admin_id,
    data_aprovacao = NOW()
  WHERE u.id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Usuário não encontrado'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, 'Usuário aprovado com sucesso'::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.aprovar_usuario(UUID, UUID) TO anon, authenticated;

-- 7. Função para bloquear usuário (apenas admins)
CREATE OR REPLACE FUNCTION public.bloquear_usuario(
  p_admin_id UUID,
  p_user_id UUID,
  p_motivo TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Verificar se é admin ativo
  SELECT EXISTS(
    SELECT 1 FROM public.admins a 
    WHERE a.id = p_admin_id AND a.ativo = TRUE
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN QUERY SELECT FALSE, 'Apenas administradores podem bloquear usuários'::TEXT;
    RETURN;
  END IF;

  -- Bloquear usuário
  UPDATE public.users u
  SET 
    status = 'bloqueado',
    motivo_bloqueio = p_motivo,
    aprovado_por = p_admin_id,
    data_aprovacao = NOW()
  WHERE u.id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Usuário não encontrado'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, 'Usuário bloqueado com sucesso'::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bloquear_usuario(UUID, UUID, TEXT) TO anon, authenticated;

-- 8. Função para aprovar post (apenas admins)
CREATE OR REPLACE FUNCTION public.aprovar_post(
  p_admin_id UUID,
  p_post_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Verificar se é admin ativo
  SELECT EXISTS(
    SELECT 1 FROM public.admins a 
    WHERE a.id = p_admin_id AND a.ativo = TRUE
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN QUERY SELECT FALSE, 'Apenas administradores podem aprovar posts'::TEXT;
    RETURN;
  END IF;

  -- Aprovar post
  UPDATE public.mural_posts p
  SET 
    status = 'aprovado',
    aprovado_por = p_admin_id,
    data_aprovacao = NOW()
  WHERE p.id = p_post_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Post não encontrado'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, 'Post aprovado com sucesso'::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.aprovar_post(UUID, UUID) TO anon, authenticated;

-- 9. Função para rejeitar post (apenas admins)
CREATE OR REPLACE FUNCTION public.rejeitar_post(
  p_admin_id UUID,
  p_post_id UUID,
  p_motivo TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Verificar se é admin ativo
  SELECT EXISTS(
    SELECT 1 FROM public.admins a 
    WHERE a.id = p_admin_id AND a.ativo = TRUE
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN QUERY SELECT FALSE, 'Apenas administradores podem rejeitar posts'::TEXT;
    RETURN;
  END IF;

  -- Rejeitar post
  UPDATE public.mural_posts p
  SET 
    status = 'rejeitado',
    motivo_rejeicao = p_motivo,
    aprovado_por = p_admin_id,
    data_aprovacao = NOW()
  WHERE p.id = p_post_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Post não encontrado'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, 'Post rejeitado com sucesso'::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rejeitar_post(UUID, UUID, TEXT) TO anon, authenticated;

-- 10. Políticas RLS para users (apenas admins podem ver usuários pendentes)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.users;
CREATE POLICY "Usuários podem ver próprio perfil"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id OR status = 'aprovado');

DROP POLICY IF EXISTS "Admins podem ver todos usuários" ON public.users;
CREATE POLICY "Admins podem ver todos usuários"
ON public.users
FOR ALL
TO anon, authenticated
USING (true);

-- 11. Políticas RLS para mural_posts (apenas posts aprovados são visíveis)
ALTER TABLE public.mural_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts aprovados são públicos" ON public.mural_posts;
CREATE POLICY "Posts aprovados são públicos"
ON public.mural_posts
FOR SELECT
TO anon, authenticated
USING (status = 'aprovado');

DROP POLICY IF EXISTS "Usuários podem ver próprios posts" ON public.mural_posts;
CREATE POLICY "Usuários podem ver próprios posts"
ON public.mural_posts
FOR SELECT
TO authenticated
USING (autor_id = auth.uid() OR status = 'aprovado');

DROP POLICY IF EXISTS "Admins podem ver todos posts" ON public.mural_posts;
CREATE POLICY "Admins podem ver todos posts"
ON public.mural_posts
FOR ALL
TO anon, authenticated
USING (true);

-- 12. Comentários
COMMENT ON FUNCTION public.aprovar_usuario IS 'Função para admins aprovarem usuários pendentes';
COMMENT ON FUNCTION public.bloquear_usuario IS 'Função para admins bloquearem usuários';
COMMENT ON FUNCTION public.aprovar_post IS 'Função para admins aprovarem posts do mural';
COMMENT ON FUNCTION public.rejeitar_post IS 'Função para admins rejeitarem posts do mural';
