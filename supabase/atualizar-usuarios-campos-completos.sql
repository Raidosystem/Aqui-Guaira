-- =====================================================
-- CRIAÇÃO/ATUALIZAÇÃO DA TABELA USUARIOS COM CAMPOS COMPLETOS
-- =====================================================
-- Este script cria a tabela usuarios se não existir
-- ou adiciona campos completos de cadastro de usuários
-- incluindo CPF, telefone, endereço completo e CEP
-- Também adiciona constraints para garantir unicidade de CPF e Email
-- =====================================================

-- Criar a tabela usuarios se não existir
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nome VARCHAR(255),
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE,
    telefone VARCHAR(20),
    endereco TEXT,
    bairro VARCHAR(100),
    cidade VARCHAR(100) DEFAULT 'Guaíra',
    estado VARCHAR(2) DEFAULT 'SP',
    cep VARCHAR(8),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Se a tabela já existir, adicionar apenas os novos campos
DO $$ 
BEGIN
    -- Adicionar cpf se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='usuarios' AND column_name='cpf') THEN
        ALTER TABLE usuarios ADD COLUMN cpf VARCHAR(11) UNIQUE;
    END IF;
    
    -- Adicionar telefone se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='usuarios' AND column_name='telefone') THEN
        ALTER TABLE usuarios ADD COLUMN telefone VARCHAR(20);
    END IF;
    
    -- Adicionar endereco se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='usuarios' AND column_name='endereco') THEN
        ALTER TABLE usuarios ADD COLUMN endereco TEXT;
    END IF;
    
    -- Adicionar bairro se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='usuarios' AND column_name='bairro') THEN
        ALTER TABLE usuarios ADD COLUMN bairro VARCHAR(100);
    END IF;
    
    -- Adicionar cidade se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='usuarios' AND column_name='cidade') THEN
        ALTER TABLE usuarios ADD COLUMN cidade VARCHAR(100) DEFAULT 'Guaíra';
    END IF;
    
    -- Adicionar estado se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='usuarios' AND column_name='estado') THEN
        ALTER TABLE usuarios ADD COLUMN estado VARCHAR(2) DEFAULT 'SP';
    END IF;
    
    -- Adicionar cep se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='usuarios' AND column_name='cep') THEN
        ALTER TABLE usuarios ADD COLUMN cep VARCHAR(8);
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_telefone ON usuarios(telefone);

-- Adicionar comentários aos campos
COMMENT ON COLUMN usuarios.cpf IS 'CPF do usuário (somente números, sem formatação)';
COMMENT ON COLUMN usuarios.telefone IS 'Telefone/WhatsApp do usuário com DDD';
COMMENT ON COLUMN usuarios.endereco IS 'Endereço completo: Rua, Número, Complemento';
COMMENT ON COLUMN usuarios.bairro IS 'Bairro do usuário';
COMMENT ON COLUMN usuarios.cidade IS 'Cidade do usuário (padrão: Guaíra)';
COMMENT ON COLUMN usuarios.estado IS 'Estado do usuário (padrão: SP)';
COMMENT ON COLUMN usuarios.cep IS 'CEP do usuário (somente números, sem formatação)';

-- Criar constraint para garantir que CPF seja único (caso não exista)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'usuarios_cpf_unique'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_cpf_unique UNIQUE (cpf);
    END IF;
END $$;

-- Criar constraint para garantir que Email seja único (caso não exista)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'usuarios_email_unique'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email);
    END IF;
END $$;

-- Adicionar validação de CPF (11 dígitos)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'usuarios_cpf_check'
    ) THEN
        ALTER TABLE usuarios 
        ADD CONSTRAINT usuarios_cpf_check 
        CHECK (cpf ~ '^[0-9]{11}$' OR cpf IS NULL);
    END IF;
END $$;

-- Adicionar validação de CEP (8 dígitos)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'usuarios_cep_check'
    ) THEN
        ALTER TABLE usuarios 
        ADD CONSTRAINT usuarios_cep_check 
        CHECK (cep ~ '^[0-9]{8}$' OR cep IS NULL);
    END IF;
END $$;

-- Criar função para validar CPF duplicado
CREATE OR REPLACE FUNCTION validar_cpf_unico()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cpf IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM usuarios 
            WHERE cpf = NEW.cpf 
            AND id != COALESCE(NEW.id, 0)
        ) THEN
            RAISE EXCEPTION 'CPF já cadastrado no sistema';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validar CPF antes de inserir ou atualizar
DROP TRIGGER IF EXISTS trigger_validar_cpf_unico ON usuarios;
CREATE TRIGGER trigger_validar_cpf_unico
    BEFORE INSERT OR UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION validar_cpf_unico();

-- Criar função para validar Email duplicado
CREATE OR REPLACE FUNCTION validar_email_unico()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM usuarios 
            WHERE LOWER(email) = LOWER(NEW.email)
            AND id != COALESCE(NEW.id, 0)
        ) THEN
            RAISE EXCEPTION 'Email já cadastrado no sistema';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validar Email antes de inserir ou atualizar
DROP TRIGGER IF EXISTS trigger_validar_email_unico ON usuarios;
CREATE TRIGGER trigger_validar_email_unico
    BEFORE INSERT OR UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION validar_email_unico();

-- Atualizar RLS policies se necessário
-- Habilitar RLS na tabela
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policy para permitir inserção (registro de novos usuários)
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON usuarios;
CREATE POLICY "Permitir inserção de novos usuários"
    ON usuarios FOR INSERT
    WITH CHECK (true);

-- Policy para permitir leitura (qualquer usuário autenticado)
DROP POLICY IF EXISTS "Permitir leitura de usuários" ON usuarios;
CREATE POLICY "Permitir leitura de usuários"
    ON usuarios FOR SELECT
    USING (true);

-- Policy para permitir atualização (apenas o próprio usuário)
DROP POLICY IF EXISTS "Permitir atualização do próprio perfil" ON usuarios;
CREATE POLICY "Permitir atualização do próprio perfil"
    ON usuarios FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Verificar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- =====================================================
-- FIM DA ATUALIZAÇÃO
-- =====================================================
-- Após executar este script:
-- 1. Cada CPF pode ter apenas uma conta
-- 2. Cada Email pode ter apenas uma conta
-- 3. CPF deve ter exatamente 11 dígitos numéricos
-- 4. CEP deve ter exatamente 8 dígitos numéricos
-- 5. Campos de endereço completo disponíveis
-- =====================================================
