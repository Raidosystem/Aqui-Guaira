-- ============================================
-- AQUI GUAÍRA - SETUP COMPLETO E DEFINITIVO
-- ============================================
-- Este arquivo contém TODO o schema do banco de dados
-- Execute em um Supabase LIMPO/ZERADO ou SUBSTITUI TUDO
-- Versão: 3.0.0 - FINAL
-- Data: 27/01/2026
-- ============================================

-- ============================================
-- 0. LIMPEZA COMPLETA (CUIDADO!)
-- ============================================
-- Este bloco APAGA TUDO e recria do zero
-- Descomente apenas se tiver CERTEZA que quer resetar tudo

-- Desabilitar RLS temporariamente
ALTER TABLE IF EXISTS public.categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comentarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.locais_turisticos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.favoritos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.historico_localizacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.listings DISABLE ROW LEVEL SECURITY;

-- Remover views (ordem importa)
DROP VIEW IF EXISTS admin_estatisticas CASCADE;
DROP VIEW IF EXISTS listings_with_category CASCADE;
DROP VIEW IF EXISTS posts_aprovados CASCADE;
DROP VIEW IF EXISTS empresas_completas CASCADE;
DROP VIEW IF EXISTS pets_com_contato CASCADE;
DROP VIEW IF EXISTS pets_perdidos_stats CASCADE;
DROP VIEW IF EXISTS achados_perdidos_stats CASCADE;

-- Remover triggers (apenas se as tabelas existirem)
DO $$ 
BEGIN
  -- Triggers só podem ser removidos se a tabela existir
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categorias') THEN
    DROP TRIGGER IF EXISTS update_categorias_updated_at ON public.categorias;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'empresas') THEN
    DROP TRIGGER IF EXISTS update_empresas_updated_at ON public.empresas;
    DROP TRIGGER IF EXISTS empresa_location_trigger ON public.empresas;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
    DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'locais_turisticos') THEN
    DROP TRIGGER IF EXISTS update_locais_updated_at ON public.locais_turisticos;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') THEN
    DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'achados_perdidos') THEN
    DROP TRIGGER IF EXISTS trigger_achados_perdidos_atualizado ON public.achados_perdidos;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pets_perdidos') THEN
    DROP TRIGGER IF EXISTS trigger_pets_perdidos_atualizado ON public.pets_perdidos;
  END IF;
END $$;

-- Remover funções
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_empresa_location() CASCADE;
DROP FUNCTION IF EXISTS buscar_empresas_proximas(DECIMAL, DECIMAL, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS incrementar_visualizacoes(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS buscar_favoritos_usuario(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS trigger_set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_achados_perdidos_atualizado_em() CASCADE;
DROP FUNCTION IF EXISTS update_pets_perdidos_atualizado_em() CASCADE;

-- Remover tabelas (ordem importa por causa das foreign keys)
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.pets_perdidos CASCADE;
DROP TABLE IF EXISTS public.achados_perdidos CASCADE;
DROP TABLE IF EXISTS public.historico_localizacao CASCADE;
DROP TABLE IF EXISTS public.favoritos CASCADE;
DROP TABLE IF EXISTS public.locais_turisticos CASCADE;
DROP TABLE IF EXISTS public.comentarios CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.mural_posts CASCADE;
DROP TABLE IF EXISTS public.empresas CASCADE;
DROP TABLE IF EXISTS public.subcategorias CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.categorias CASCADE;

-- Remover políticas de storage
DROP POLICY IF EXISTS "Locais images - Public access" ON storage.objects;
DROP POLICY IF EXISTS "Posts images - Public access" ON storage.objects;
DROP POLICY IF EXISTS "Empresas images - Public access" ON storage.objects;
DROP POLICY IF EXISTS "Imagens públicas" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Empresas images - Public read" ON storage.objects;
DROP POLICY IF EXISTS "Empresas images - Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Empresas images - Owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Posts images - Public read" ON storage.objects;
DROP POLICY IF EXISTS "Posts images - Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Posts images - Owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Locais images - Public read" ON storage.objects;
DROP POLICY IF EXISTS "Locais images - Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Locais images - Owner delete" ON storage.objects;

-- NOTA: Buckets NÃO são removidos para preservar imagens existentes
-- Se quiser limpar tudo, delete manualmente pelo painel do Supabase Storage

SELECT '🧹 LIMPEZA COMPLETA REALIZADA!' AS status;

-- ============================================
-- 1. EXTENSÕES NECESSÁRIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. CATEGORIAS DE EMPRESAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  icone TEXT,
  cor TEXT DEFAULT '#10b981',
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome VARCHAR(255),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ADMINISTRADORES
-- ============================================
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. EMPRESAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  
  -- Localização
  endereco TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT DEFAULT 'Guaíra',
  estado TEXT DEFAULT 'SP',
  cep TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(Point, 4326),
  
  -- Contato
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  site TEXT,
  instagram TEXT,
  facebook TEXT,
  google_maps_link TEXT,
  
  -- Horários (JSON array)
  horarios JSONB DEFAULT '[]'::JSONB,
  
  -- Imagens (array de URLs)
  imagens TEXT[] DEFAULT ARRAY[]::TEXT[],
  logo TEXT,
  
  -- Status e metadata
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'inativo')),
  verificado BOOLEAN DEFAULT FALSE,
  destaque BOOLEAN DEFAULT FALSE,
  visualizacoes INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,
  motivo_bloqueio TEXT,
  
  -- Dono/responsável
  responsavel_nome TEXT,
  responsavel_email TEXT,
  responsavel_telefone TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_empresas_categoria ON public.empresas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_empresas_bairro ON public.empresas(bairro);
CREATE INDEX IF NOT EXISTS idx_empresas_status ON public.empresas(status);
CREATE INDEX IF NOT EXISTS idx_empresas_location ON public.empresas USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_empresas_slug ON public.empresas(slug);
CREATE INDEX IF NOT EXISTS idx_empresas_ativa ON public.empresas(ativa);

-- ============================================
-- 6. POSTS DO MURAL
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  autor_nome TEXT NOT NULL,
  autor_bairro TEXT NOT NULL,
  autor_email TEXT,
  conteudo TEXT NOT NULL,
  imagens TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Moderação
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  moderado_por TEXT,
  moderado_em TIMESTAMP WITH TIME ZONE,
  motivo_rejeicao TEXT,
  
  -- Engajamento
  curtidas INTEGER DEFAULT 0,
  comentarios INTEGER DEFAULT 0,
  
  -- Usuário
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  autor_anonimo BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_bairro ON public.posts(autor_bairro);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);

-- ============================================
-- 7. COMENTÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  autor_nome TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  status TEXT DEFAULT 'aprovado' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  autor_anonimo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comentarios_post ON public.comentarios(post_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON public.comentarios(created_at);
CREATE INDEX IF NOT EXISTS idx_comentarios_user_id ON public.comentarios(user_id);

-- ============================================
-- 8. LOCAIS TURÍSTICOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.locais_turisticos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  
  -- Localização
  endereco TEXT,
  bairro TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(Point, 4326),
  
  -- Informações adicionais
  imagens TEXT[] DEFAULT ARRAY[]::TEXT[],
  horario_funcionamento TEXT,
  entrada_gratuita BOOLEAN DEFAULT TRUE,
  valor_entrada DECIMAL(10, 2),
  acessibilidade BOOLEAN DEFAULT FALSE,
  estacionamento BOOLEAN DEFAULT FALSE,
  
  -- Contato
  telefone TEXT,
  site TEXT,
  
  -- Status
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'manutencao')),
  destaque BOOLEAN DEFAULT FALSE,
  visualizacoes INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locais_categoria ON public.locais_turisticos(categoria);
CREATE INDEX IF NOT EXISTS idx_locais_status ON public.locais_turisticos(status);
CREATE INDEX IF NOT EXISTS idx_locais_location ON public.locais_turisticos USING GIST(location);

-- ============================================
-- 9. FAVORITOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (tipo IN ('empresa', 'local', 'post')),
  item_id UUID NOT NULL,
  user_identifier TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_favoritos_user_identifier ON public.favoritos(user_identifier);
CREATE INDEX IF NOT EXISTS idx_favoritos_item ON public.favoritos(item_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_user_id ON public.favoritos(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favoritos_unique ON public.favoritos(user_identifier, tipo, item_id);

-- ============================================
-- 10. HISTÓRICO DE LOCALIZAÇÃO
-- ============================================
CREATE TABLE IF NOT EXISTS public.historico_localizacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_identifier TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('empresa', 'local')),
  item_id UUID NOT NULL,
  visualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_user ON public.historico_localizacao(user_identifier);
CREATE INDEX IF NOT EXISTS idx_historico_visualizado ON public.historico_localizacao(visualizado_em DESC);

-- ============================================
-- 11. ACHADOS E PERDIDOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.achados_perdidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('perdido', 'encontrado')),
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'recuperado')),
  bairro VARCHAR(200) NOT NULL,
  local_referencia TEXT,
  data_ocorrencia DATE NOT NULL,
  telefone_contato VARCHAR(20) NOT NULL,
  nome_contato VARCHAR(200) NOT NULL,
  imagem TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achados_perdidos_tipo ON public.achados_perdidos(tipo);
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_status ON public.achados_perdidos(status);
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_categoria ON public.achados_perdidos(categoria);
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_bairro ON public.achados_perdidos(bairro);
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_user ON public.achados_perdidos(user_id);
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_data ON public.achados_perdidos(data_ocorrencia DESC);

-- ============================================
-- 12. PETS PERDIDOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.pets_perdidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('cachorro', 'gato', 'outro')),
  raca VARCHAR(200),
  cor VARCHAR(100) NOT NULL,
  porte VARCHAR(20) CHECK (porte IN ('pequeno', 'medio', 'grande')),
  idade_aproximada VARCHAR(100),
  descricao TEXT NOT NULL,
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('perdido', 'encontrado', 'adocao')),
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'resolvido')),
  bairro VARCHAR(200) NOT NULL,
  local_referencia TEXT,
  data_ocorrencia DATE NOT NULL,
  telefone_contato VARCHAR(20) NOT NULL,
  whatsapp_contato VARCHAR(20),
  nome_contato VARCHAR(200) NOT NULL,
  caracteristicas_especiais TEXT,
  imagem TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_perdidos_tipo ON public.pets_perdidos(tipo);
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_categoria ON public.pets_perdidos(categoria);
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_status ON public.pets_perdidos(status);
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_bairro ON public.pets_perdidos(bairro);
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_user ON public.pets_perdidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_data ON public.pets_perdidos(data_ocorrencia DESC);

-- ============================================
-- 13. MARKETPLACE - CATEGORIAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 14. MARKETPLACE - ANÚNCIOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  city VARCHAR(100) DEFAULT 'Guaíra',
  state VARCHAR(2) DEFAULT 'SP',
  views INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);

-- ============================================
-- 15. LOGS DE ADMIN
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.users(id) NOT NULL,
  acao TEXT NOT NULL,
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  detalhes JSONB,
  data_acao TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_data ON public.admin_logs(data_acao DESC);

-- ============================================
-- 16. FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar location de empresas
CREATE OR REPLACE FUNCTION update_empresa_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::GEOGRAPHY;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar empresas próximas
CREATE OR REPLACE FUNCTION buscar_empresas_proximas(
  lat DECIMAL,
  lng DECIMAL,
  raio_metros INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  distancia_metros DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.nome,
    ST_Distance(
      e.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY
    ) AS distancia_metros
  FROM public.empresas e
  WHERE 
    e.status = 'aprovado'
    AND ST_DWithin(
      e.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY,
      raio_metros
    )
  ORDER BY distancia_metros;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar visualizações
CREATE OR REPLACE FUNCTION incrementar_visualizacoes(
  tabela TEXT,
  item_id UUID
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE public.%I SET visualizacoes = visualizacoes + 1 WHERE id = $1', tabela)
  USING item_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 17. TRIGGERS
-- ============================================

-- Trigger para updated_at em categorias
DROP TRIGGER IF EXISTS update_categorias_updated_at ON public.categorias;
CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at em users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at em empresas
DROP TRIGGER IF EXISTS update_empresas_updated_at ON public.empresas;
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para location em empresas
DROP TRIGGER IF EXISTS empresa_location_trigger ON public.empresas;
CREATE TRIGGER empresa_location_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_empresa_location();

-- Trigger para updated_at em posts
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at em locais
DROP TRIGGER IF EXISTS update_locais_updated_at ON public.locais_turisticos;
CREATE TRIGGER update_locais_updated_at
  BEFORE UPDATE ON public.locais_turisticos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at em listings
DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizado_em em achados_perdidos
DROP TRIGGER IF EXISTS trigger_achados_perdidos_atualizado ON public.achados_perdidos;
CREATE TRIGGER trigger_achados_perdidos_atualizado
  BEFORE UPDATE ON public.achados_perdidos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizado_em em pets_perdidos
DROP TRIGGER IF EXISTS trigger_pets_perdidos_atualizado ON public.pets_perdidos;
CREATE TRIGGER trigger_pets_perdidos_atualizado
  BEFORE UPDATE ON public.pets_perdidos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 18. VIEWS
-- ============================================

-- View de empresas completas
CREATE OR REPLACE VIEW empresas_completas AS
SELECT 
  e.*,
  c.nome AS categoria_nome,
  c.icone AS categoria_icone,
  c.cor AS categoria_cor
FROM public.empresas e
LEFT JOIN public.categorias c ON c.id = e.categoria_id
WHERE e.status = 'aprovado' AND e.ativa = TRUE;

-- View de posts aprovados
CREATE OR REPLACE VIEW posts_aprovados AS
SELECT 
  p.*,
  COALESCE(u.nome, p.autor_nome) AS autor_nome_final,
  u.avatar_url AS autor_avatar,
  (SELECT COUNT(*) FROM public.comentarios WHERE post_id = p.id AND status = 'aprovado') AS total_comentarios
FROM public.posts p
LEFT JOIN public.users u ON u.id = p.user_id
WHERE p.status = 'aprovado'
ORDER BY p.created_at DESC;

-- View de listings com categoria
CREATE OR REPLACE VIEW listings_with_category AS
SELECT 
  l.*,
  c.name AS category,
  c.icon AS category_icon
FROM listings l
LEFT JOIN categories c ON l.category_id = c.id;

-- View de estatísticas admin
CREATE OR REPLACE VIEW admin_estatisticas AS
SELECT 
  (SELECT COUNT(*) FROM empresas WHERE ativa = TRUE) AS empresas_ativas,
  (SELECT COUNT(*) FROM empresas WHERE ativa = FALSE) AS empresas_bloqueadas,
  (SELECT COUNT(*) FROM empresas) AS total_empresas,
  (SELECT COUNT(*) FROM posts WHERE status = 'pendente') AS posts_pendentes,
  (SELECT COUNT(*) FROM posts WHERE status = 'aprovado') AS posts_aprovados,
  (SELECT COUNT(*) FROM users) AS total_usuarios,
  (SELECT COUNT(*) FROM users WHERE is_admin = TRUE) AS total_admins;

-- ============================================
-- 19. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locais_turisticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_localizacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias
DROP POLICY IF EXISTS "Categorias são públicas" ON public.categorias;
CREATE POLICY "Categorias são públicas"
  ON public.categorias FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Políticas para empresas
DROP POLICY IF EXISTS "Empresas aprovadas são públicas" ON public.empresas;
CREATE POLICY "Empresas aprovadas são públicas"
  ON public.empresas FOR SELECT
  TO anon, authenticated
  USING (status = 'aprovado' AND ativa = TRUE);

DROP POLICY IF EXISTS "Usuários autenticados podem inserir empresas" ON public.empresas;
CREATE POLICY "Usuários autenticados podem inserir empresas"
  ON public.empresas FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Políticas para posts
DROP POLICY IF EXISTS "Posts aprovados são públicos" ON public.posts;
CREATE POLICY "Posts aprovados são públicos"
  ON public.posts FOR SELECT
  TO anon, authenticated
  USING (status = 'aprovado');

DROP POLICY IF EXISTS "Qualquer um pode criar posts" ON public.posts;
CREATE POLICY "Qualquer um pode criar posts"
  ON public.posts FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Políticas para comentários
DROP POLICY IF EXISTS "Comentários aprovados são públicos" ON public.comentarios;
CREATE POLICY "Comentários aprovados são públicos"
  ON public.comentarios FOR SELECT
  TO anon, authenticated
  USING (status = 'aprovado');

DROP POLICY IF EXISTS "Qualquer um pode comentar" ON public.comentarios;
CREATE POLICY "Qualquer um pode comentar"
  ON public.comentarios FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Políticas para locais
DROP POLICY IF EXISTS "Locais ativos são públicos" ON public.locais_turisticos;
CREATE POLICY "Locais ativos são públicos"
  ON public.locais_turisticos FOR SELECT
  TO anon, authenticated
  USING (status = 'ativo');

-- Políticas para favoritos
DROP POLICY IF EXISTS "Usuários podem gerenciar favoritos" ON public.favoritos;
CREATE POLICY "Usuários podem gerenciar favoritos"
  ON public.favoritos FOR ALL
  TO anon, authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Políticas para histórico
DROP POLICY IF EXISTS "Usuários podem gerenciar histórico" ON public.historico_localizacao;
CREATE POLICY "Usuários podem gerenciar histórico"
  ON public.historico_localizacao FOR ALL
  TO anon, authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Políticas para categorias marketplace
DROP POLICY IF EXISTS "Categorias marketplace são públicas" ON public.categories;
CREATE POLICY "Categorias marketplace são públicas"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Políticas para listings
DROP POLICY IF EXISTS "Anúncios ativos são públicos" ON public.listings;
CREATE POLICY "Anúncios ativos são públicos"
  ON public.listings FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "Usuários podem criar anúncios" ON public.listings;
CREATE POLICY "Usuários podem criar anúncios"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- ============================================
-- 20. STORAGE BUCKETS
-- ============================================

-- Criar buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('empresas-images', 'empresas-images', TRUE, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('posts-images', 'posts-images', TRUE, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('locais-images', 'locais-images', TRUE, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Políticas de storage
DROP POLICY IF EXISTS "Empresas images - Public access" ON storage.objects;
CREATE POLICY "Empresas images - Public access"
  ON storage.objects FOR ALL
  TO public
  USING (bucket_id = 'empresas-images')
  WITH CHECK (bucket_id = 'empresas-images');

DROP POLICY IF EXISTS "Posts images - Public access" ON storage.objects;
CREATE POLICY "Posts images - Public access"
  ON storage.objects FOR ALL
  TO public
  USING (bucket_id = 'posts-images')
  WITH CHECK (bucket_id = 'posts-images');

DROP POLICY IF EXISTS "Locais images - Public access" ON storage.objects;
CREATE POLICY "Locais images - Public access"
  ON storage.objects FOR ALL
  TO public
  USING (bucket_id = 'locais-images')
  WITH CHECK (bucket_id = 'locais-images');

-- ============================================
-- 21. DADOS INICIAIS - CATEGORIAS
-- ============================================

INSERT INTO public.categorias (nome, icone, cor, ordem) VALUES
  ('Alimentação', 'UtensilsCrossed', '#FF6B6B', 1),
  ('Restaurantes', 'UtensilsCrossed', '#FF6B6B', 2),
  ('Padarias', 'Croissant', '#FFA94D', 3),
  ('Lanchonetes', 'Coffee', '#FFD93D', 4),
  ('Bares', 'Beer', '#95E1D3', 5),
  ('Serviços', 'Wrench', '#4ECDC4', 10),
  ('Salão de Beleza', 'Scissors', '#FF85A2', 11),
  ('Barbearia', 'Scissors', '#A8DADC', 12),
  ('Mecânica', 'Wrench', '#457B9D', 13),
  ('Eletricista', 'Zap', '#F4A261', 14),
  ('Encanador', 'Droplet', '#2A9D8F', 15),
  ('Pedreiro', 'Hammer', '#E76F51', 16),
  ('Marcenaria', 'Hammer', '#8B4513', 17),
  ('Comércio', 'ShoppingBag', '#45B7D1', 20),
  ('Supermercado', 'ShoppingCart', '#3A86FF', 21),
  ('Farmácia', 'Pill', '#06D6A0', 22),
  ('Lotérica', 'Ticket', '#FFB703', 23),
  ('Papelaria', 'Pen', '#8338EC', 24),
  ('Loja de Roupas', 'Shirt', '#FF006E', 25),
  ('Calçados', 'Footprints', '#FB5607', 26),
  ('Pet Shop', 'PawPrint', '#06FFA5', 27),
  ('Saúde', 'Heart', '#96CEB4', 30),
  ('Clínica Médica', 'Stethoscope', '#48CAE4', 31),
  ('Odontologia', 'Smile', '#00B4D8', 32),
  ('Fisioterapia', 'Activity', '#0077B6', 33),
  ('Psicologia', 'Brain', '#90E0EF', 34),
  ('Academia', 'Dumbbell', '#FF4D6D', 35),
  ('Educação', 'GraduationCap', '#FFEAA7', 40),
  ('Escola', 'School', '#FFD60A', 41),
  ('Curso de Idiomas', 'Languages', '#FFC300', 42),
  ('Curso Técnico', 'BookOpen', '#FFB700', 43),
  ('Reforço Escolar', 'Book', '#FFAA00', 44),
  ('Entretenimento', 'Ticket', '#DFE6E9', 50),
  ('Cinema', 'Film', '#6C5CE7', 51),
  ('Teatro', 'Theater', '#A29BFE', 52),
  ('Esporte', 'Trophy', '#00B894', 53),
  ('Eventos', 'Calendar', '#FDCB6E', 54),
  ('Tecnologia', 'Smartphone', '#74B9FF', 60),
  ('Assistência Técnica', 'Laptop', '#0984E3', 61),
  ('Informática', 'Monitor', '#6C5CE7', 62),
  ('Automotivo', 'Car', '#636E72', 70),
  ('Auto Peças', 'Cog', '#2D3436', 71),
  ('Lava Rápido', 'Droplets', '#00CEC9', 72),
  ('Estacionamento', 'SquareParking', '#636E72', 73),
  ('Construção', 'Hammer', '#E17055', 80),
  ('Material de Construção', 'BrickWall', '#D63031', 81),
  ('Pintura', 'Paintbrush', '#FD79A8', 82),
  ('Imóveis', 'Home', '#00B894', 90),
  ('Imobiliária', 'Building', '#00CEC9', 91),
  ('Turismo', 'Plane', '#A29BFE', 100),
  ('Hotel', 'Bed', '#6C5CE7', 101),
  ('Pousada', 'House', '#74B9FF', 102),
  ('Outros', 'MoreHorizontal', '#B2BEC3', 999)
ON CONFLICT (nome) DO UPDATE SET
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ============================================
-- 22. DADOS INICIAIS - CATEGORIAS MARKETPLACE
-- ============================================

INSERT INTO public.categories (name, icon) VALUES
  ('Veículos - Carros', 'Car'),
  ('Veículos - Motos', 'Bike'),
  ('Eletrônicos', 'Smartphone'),
  ('Moda', 'Shirt'),
  ('Casa e Decoração', 'Home'),
  ('Alimentação', 'Utensils'),
  ('Esportes e Lazer', 'Dumbbell'),
  ('Serviços', 'Briefcase'),
  ('Outros', 'Package')
ON CONFLICT DO NOTHING;

-- ============================================
-- 23. DADOS INICIAIS - LOCAIS TURÍSTICOS
-- ============================================

INSERT INTO public.locais_turisticos (nome, slug, descricao, categoria, endereco, bairro, latitude, longitude, imagens, horario_funcionamento, entrada_gratuita) VALUES
  (
    'Lago Maracá',
    'lago-maraca',
    'Complexo de esporte e lazer com pistas de caminhada/ciclismo, quadras de areia e pesca.',
    'parque',
    'Av. Principal, s/n',
    'Centro',
    -20.3167,
    -48.3167,
    ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    '6h - 18h (todos os dias)',
    TRUE
  ),
  (
    'Praça São Sebastião (Jardim Japonês)',
    'jardim-japones',
    'Bela praça com jardim japonês, ideal para caminhadas e momentos de contemplação.',
    'praça',
    'Rua Central',
    'Centro',
    -20.3165,
    -48.3165,
    ARRAY['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800'],
    '24h',
    TRUE
  ),
  (
    'Casa de Cultura',
    'casa-de-cultura',
    'Espaço cultural com exposições, eventos e atividades artísticas.',
    'museu',
    'Rua Cultural, 123',
    'Centro',
    -20.3170,
    -48.3170,
    ARRAY['https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800'],
    'Ter-Dom: 9h - 17h',
    TRUE
  ),
  (
    'Escultura de Tomie Ohtake',
    'escultura-tomie-ohtake',
    'Monumento artístico em homenagem à renomada artista plástica.',
    'monumento',
    'Praça das Artes',
    'Centro',
    -20.3168,
    -48.3168,
    ARRAY['https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800'],
    '24h',
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FIM DO SETUP
-- ============================================

SELECT '✅ SETUP COMPLETO EXECUTADO COM SUCESSO!' AS status;
SELECT COUNT(*) || ' categorias criadas' AS categorias FROM public.categorias;
SELECT COUNT(*) || ' categorias marketplace criadas' AS marketplace FROM public.categories;
SELECT COUNT(*) || ' locais turísticos criados' AS locais FROM public.locais_turisticos;
