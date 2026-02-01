-- Criar tabela de posts do mural

CREATE TABLE IF NOT EXISTS public.mural_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  categoria TEXT,
  autor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  autor_nome TEXT,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  imagens TEXT[],
  tags TEXT[],
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  aprovado_por UUID REFERENCES public.admins(id),
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  motivo_rejeicao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_mural_posts_status ON public.mural_posts(status);
CREATE INDEX IF NOT EXISTS idx_mural_posts_autor ON public.mural_posts(autor_id);
CREATE INDEX IF NOT EXISTS idx_mural_posts_empresa ON public.mural_posts(empresa_id);
CREATE INDEX IF NOT EXISTS idx_mural_posts_created ON public.mural_posts(created_at DESC);

-- Criar tabela de comentários (opcional, para futuro)
CREATE TABLE IF NOT EXISTS public.mural_comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.mural_posts(id) ON DELETE CASCADE,
  autor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  autor_nome TEXT,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mural_comentarios_post ON public.mural_comentarios(post_id);

-- Habilitar RLS
ALTER TABLE public.mural_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mural_comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas para posts (apenas aprovados são públicos)
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

DROP POLICY IF EXISTS "Usuários podem criar posts" ON public.mural_posts;
CREATE POLICY "Usuários podem criar posts"
ON public.mural_posts
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem editar próprios posts" ON public.mural_posts;
CREATE POLICY "Usuários podem editar próprios posts"
ON public.mural_posts
FOR UPDATE
TO authenticated
USING (autor_id = auth.uid());

DROP POLICY IF EXISTS "Admins podem fazer tudo com posts" ON public.mural_posts;
CREATE POLICY "Admins podem fazer tudo com posts"
ON public.mural_posts
FOR ALL
TO anon, authenticated
USING (true);

-- Políticas para comentários
DROP POLICY IF EXISTS "Comentários são públicos" ON public.mural_comentarios;
CREATE POLICY "Comentários são públicos"
ON public.mural_comentarios
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem criar comentários" ON public.mural_comentarios;
CREATE POLICY "Usuários podem criar comentários"
ON public.mural_comentarios
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Funções para aprovar/rejeitar posts
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

-- Comentários
COMMENT ON TABLE public.mural_posts IS 'Posts do mural comunitário - requerem aprovação de admin';
COMMENT ON TABLE public.mural_comentarios IS 'Comentários nos posts do mural';
COMMENT ON FUNCTION public.aprovar_post IS 'Função para admins aprovarem posts do mural';
COMMENT ON FUNCTION public.rejeitar_post IS 'Função para admins rejeitarem posts do mural';
