-- ============================================
-- AQUI GUAÍRA - SETUP COMPLETO ATUALIZADO
-- Execute este arquivo no Supabase SQL Editor
-- Versão: 2.0.0 (Com Marketplace integrado)
-- Data: 27/01/2026
-- ============================================

-- ============================================
-- 1. EXTENSÕES NECESSÁRIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- 2. TABELAS PRINCIPAIS
-- ============================================

-- CATEGORIAS DE EMPRESAS
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  icone TEXT,
  cor TEXT DEFAULT '#10b981',
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBCATEGORIAS
CREATE TABLE IF NOT EXISTS public.subcategorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  icone TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USUÁRIOS
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

-- ADMINISTRADORES
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- EMPRESAS
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  cnpj VARCHAR(18) UNIQUE,
  telefone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  bairro TEXT,
  cidade TEXT DEFAULT 'Guaíra',
  estado TEXT DEFAULT 'SP',
  cep VARCHAR(10),
  categoria_id UUID REFERENCES categorias(id),
  logo_url TEXT,
  banner_url TEXT,
  site TEXT,
  instagram TEXT,
  facebook TEXT,
  google_maps_link TEXT,
  horario_funcionamento TEXT,
  destaque BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna subcategoria_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'empresas' AND column_name = 'subcategoria_id'
  ) THEN
    ALTER TABLE empresas ADD COLUMN subcategoria_id UUID REFERENCES subcategorias(id);
  END IF;
END $$;

-- LOCAIS (Pontos de Interesse)
CREATE TABLE IF NOT EXISTS public.locais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  categoria VARCHAR(100),
  endereco TEXT,
  bairro VARCHAR(100),
  cidade VARCHAR(100) DEFAULT 'Guaíra',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  telefone VARCHAR(20),
  horario TEXT,
  descricao TEXT,
  site TEXT,
  imagem_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MURAL/POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  autor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  autor_nome VARCHAR(255),
  telefone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'ativo',
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACHADOS E PERDIDOS
CREATE TABLE IF NOT EXISTS public.achados_perdidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('achado', 'perdido')),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  local TEXT,
  data_ocorrencia DATE,
  imagem_url TEXT,
  contato VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'resolvido', 'inativo')),
  usuario_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PETS PERDIDOS
CREATE TABLE IF NOT EXISTS public.pets_perdidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_animal VARCHAR(50) NOT NULL,
  nome_pet VARCHAR(100),
  raca VARCHAR(100),
  cor VARCHAR(100),
  tamanho VARCHAR(20),
  descricao TEXT NOT NULL,
  local_desaparecimento TEXT,
  data_desaparecimento DATE,
  imagem_url TEXT,
  contato VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  recompensa TEXT,
  status VARCHAR(20) DEFAULT 'perdido' CHECK (status IN ('perdido', 'encontrado', 'inativo')),
  usuario_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAVORITOS
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, empresa_id)
);

-- HISTÓRICO DE ACESSOS
CREATE TABLE IF NOT EXISTS public.historico_acessos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SISTEMA DE PLANTÃO
CREATE TABLE IF NOT EXISTS public.escalas_plantao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id UUID REFERENCES locais(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  periodo VARCHAR(20) CHECK (periodo IN ('diurno', 'noturno', 'integral')),
  horario_inicio TIME,
  horario_fim TIME,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(local_id, data, periodo)
);

-- PAINEL DA CIDADE
CREATE TABLE IF NOT EXISTS public.paineis_cidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT,
  dados JSONB,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. MARKETPLACE - NOVAS TABELAS
-- ============================================

-- CATEGORIAS DO MARKETPLACE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ANÚNCIOS DO MARKETPLACE
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

-- ============================================
-- 4. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para empresas
CREATE INDEX IF NOT EXISTS idx_empresas_categoria ON empresas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_cidade ON empresas(cidade);
CREATE INDEX IF NOT EXISTS idx_empresas_destaque ON empresas(destaque) WHERE destaque = TRUE;

-- Índice para subcategoria (se a coluna existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'empresas' AND column_name = 'subcategoria_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_empresas_subcategoria ON empresas(subcategoria_id);
  END IF;
END $$;

-- Índices para locais
CREATE INDEX IF NOT EXISTS idx_locais_tipo ON locais(tipo);
CREATE INDEX IF NOT EXISTS idx_locais_cidade ON locais(cidade);
CREATE INDEX IF NOT EXISTS idx_locais_ativo ON locais(ativo);

-- Índices para posts
CREATE INDEX IF NOT EXISTS idx_posts_tipo ON posts(tipo);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- Índices para favoritos
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_empresa ON favoritos(empresa_id);

-- Índices para histórico
CREATE INDEX IF NOT EXISTS idx_historico_usuario ON historico_acessos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_empresa ON historico_acessos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_historico_created ON historico_acessos(created_at DESC);

-- Índices para marketplace
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE achados_perdidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets_perdidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_acessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Políticas para empresas
DROP POLICY IF EXISTS "Empresas são visíveis para todos" ON empresas;
CREATE POLICY "Empresas são visíveis para todos" ON empresas
  FOR SELECT USING (ativo = TRUE);

DROP POLICY IF EXISTS "Usuários podem criar suas empresas" ON empresas;
CREATE POLICY "Usuários podem criar suas empresas" ON empresas
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem editar suas empresas" ON empresas;
CREATE POLICY "Usuários podem editar suas empresas" ON empresas
  FOR UPDATE USING (true);

-- Políticas para posts
DROP POLICY IF EXISTS "Posts são visíveis para todos" ON posts;
CREATE POLICY "Posts são visíveis para todos" ON posts
  FOR SELECT USING (status = 'ativo');

DROP POLICY IF EXISTS "Usuários podem criar posts" ON posts;
CREATE POLICY "Usuários podem criar posts" ON posts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem editar seus posts" ON posts;
CREATE POLICY "Usuários podem editar seus posts" ON posts
  FOR UPDATE USING (true);

-- Políticas para favoritos
DROP POLICY IF EXISTS "Usuários veem seus favoritos" ON favoritos;
CREATE POLICY "Usuários veem seus favoritos" ON favoritos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem adicionar favoritos" ON favoritos;
CREATE POLICY "Usuários podem adicionar favoritos" ON favoritos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem remover favoritos" ON favoritos;
CREATE POLICY "Usuários podem remover favoritos" ON favoritos
  FOR DELETE USING (true);

-- Políticas para marketplace
DROP POLICY IF EXISTS "Categorias são visíveis para todos" ON categories;
CREATE POLICY "Categorias são visíveis para todos" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anúncios são visíveis para todos" ON listings;
CREATE POLICY "Anúncios são visíveis para todos" ON listings
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Usuários podem criar anúncios" ON listings;
CREATE POLICY "Usuários podem criar anúncios" ON listings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem editar seus anúncios" ON listings;
CREATE POLICY "Usuários podem editar seus anúncios" ON listings
  FOR UPDATE USING (true);

-- ============================================
-- 6. FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;
CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. VIEWS
-- ============================================

-- View de empresas com categoria (simplificada)
CREATE OR REPLACE VIEW empresas_completas AS
SELECT 
  e.id,
  e.nome,
  e.descricao,
  e.cnpj,
  e.telefone,
  e.whatsapp,
  e.email,
  e.endereco,
  e.bairro,
  e.cidade,
  e.estado,
  e.cep,
  e.categoria_id,
  e.logo_url,
  e.banner_url,
  e.site,
  e.instagram,
  e.facebook,
  e.google_maps_link,
  e.horario_funcionamento,
  e.destaque,
  e.ativo,
  e.visualizacoes,
  e.created_at,
  e.updated_at,
  c.nome as categoria_nome,
  c.icone as categoria_icone,
  c.cor as categoria_cor
FROM empresas e
LEFT JOIN categorias c ON e.categoria_id = c.id
WHERE e.ativo = TRUE;

-- View de listings com categoria
CREATE OR REPLACE VIEW listings_with_category AS
SELECT 
  l.*,
  c.name as category,
  c.icon as category_icon
FROM listings l
LEFT JOIN categories c ON l.category_id = c.id;

-- ============================================
-- 8. STORAGE BUCKETS
-- ============================================

-- Criar buckets se não existirem
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('empresas-logos', 'empresas-logos', true),
  ('empresas-banners', 'empresas-banners', true),
  ('posts-images', 'posts-images', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
DROP POLICY IF EXISTS "Imagens públicas" ON storage.objects;
CREATE POLICY "Imagens públicas" ON storage.objects
  FOR SELECT USING (bucket_id IN ('empresas-logos', 'empresas-banners', 'posts-images', 'avatars'));

DROP POLICY IF EXISTS "Usuários podem fazer upload" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 9. DADOS INICIAIS - CATEGORIAS
-- ============================================

INSERT INTO categorias (nome, icone, cor, ordem) VALUES
  ('Alimentação', 'UtensilsCrossed', '#ef4444', 1),
  ('Saúde', 'Heart', '#10b981', 2),
  ('Educação', 'GraduationCap', '#3b82f6', 3),
  ('Serviços', 'Briefcase', '#8b5cf6', 4),
  ('Comércio', 'ShoppingBag', '#f59e0b', 5),
  ('Tecnologia', 'Cpu', '#06b6d4', 6),
  ('Construção', 'HardHat', '#f97316', 7),
  ('Beleza', 'Scissors', '#ec4899', 8),
  ('Automotivo', 'Car', '#14b8a6', 9),
  ('Lazer', 'Music', '#a855f7', 10)
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- 10. DADOS INICIAIS - CATEGORIAS MARKETPLACE
-- ============================================

INSERT INTO categories (name, icon) VALUES
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
-- SETUP COMPLETO!
-- ============================================
-- Agora você pode:
-- 1. Cadastrar empresas
-- 2. Criar posts no mural
-- 3. Adicionar achados e perdidos
-- 4. Registrar pets perdidos
-- 5. Publicar anúncios no marketplace
-- 6. Gerenciar favoritos e histórico
-- ============================================
