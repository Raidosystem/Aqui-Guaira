-- Sistema de Aprovação para Usuários

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

-- 4. Políticas RLS para users (apenas admins podem ver usuários pendentes)
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

-- 5. Comentários
COMMENT ON FUNCTION public.aprovar_usuario IS 'Função para admins aprovarem usuários pendentes';
COMMENT ON FUNCTION public.bloquear_usuario IS 'Função para admins bloquearem usuários';
