-- SQL para atualizar a tabela mural_posts e garantir que todas as colunas necessárias existam

-- 1. Cria a tabela se ela não existir
CREATE TABLE IF NOT EXISTS public.mural_posts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    conteudo text,
    CONSTRAINT mural_posts_pkey PRIMARY KEY (id)
);

-- 2. Adiciona as colunas que estavam faltando ou que podem ter nomes diferentes
ALTER TABLE public.mural_posts
ADD COLUMN IF NOT EXISTS titulo text,
ADD COLUMN IF NOT EXISTS autor_nome text,
ADD COLUMN IF NOT EXISTS autor_email text,
ADD COLUMN IF NOT EXISTS autor_bairro text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS logradouro text,
ADD COLUMN IF NOT EXISTS imagens text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS aprovado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS data_criacao timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id); -- Garante que user_id exista

-- 3. Tenta migrar dados de autor_id para user_id se autor_id existir e user_id estiver vazio
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mural_posts' AND column_name = 'autor_id') THEN
        UPDATE public.mural_posts SET user_id = autor_id WHERE user_id IS NULL;
    END IF;
END $$;

-- 4. Garante permissões e Policies
ALTER TABLE public.mural_posts ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas
DROP POLICY IF EXISTS "Posts aprovados são públicos" ON public.mural_posts;
DROP POLICY IF EXISTS "Permitir criar posts" ON public.mural_posts;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios posts" ON public.mural_posts;

-- Cria novas políticas usando user_id (agora garantido)
CREATE POLICY "Posts aprovados são públicos" ON public.mural_posts
FOR SELECT USING (true);

CREATE POLICY "Permitir criar posts" ON public.mural_posts
FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem gerenciar seus próprios posts" ON public.mural_posts
FOR ALL USING (auth.uid() = user_id);

-- Concede permissões
GRANT ALL ON public.mural_posts TO anon;
GRANT ALL ON public.mural_posts TO authenticated;
GRANT ALL ON public.mural_posts TO service_role;

-- Tabela de Comentários
CREATE TABLE IF NOT EXISTS public.comentarios (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    post_id uuid REFERENCES public.mural_posts(id) ON DELETE CASCADE,
    autor_nome text,
    conteudo text,
    user_id uuid REFERENCES auth.users(id),
    status text DEFAULT 'aprovado',
    CONSTRAINT comentarios_pkey PRIMARY KEY (id)
);

GRANT ALL ON public.comentarios TO anon;
GRANT ALL ON public.comentarios TO authenticated;
GRANT ALL ON public.comentarios TO service_role;
